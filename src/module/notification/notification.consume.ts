import { Controller, Inject, OnModuleInit } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { RabbitMQClient } from "src/share/components/rabbitmq";
import { NOTIFICATION_SERVICE } from "./notification.di-token";
import { EvtOrderCreated, EvtOrderUpdated, OrderCreatedEvent, OrderUpdatedEvent } from "src/share/event/oder.evt";
import { request } from "axios";
import { UserRole } from "src/share";
import { NotificationType } from "./notification.model";
import { EvtPaymentCreated, EvtPaymentUpdated, PaymentCreatedEvent, PaymentUpdatedEvent } from "src/share/event/payment.evt";
import { EvtReservationCreated, EvtReservationUpdated, ReservationCreatedEvent, ReservationUpdatedEvent } from "src/share/event/reservation.evt";
import { EvtPointsDecreased, EvtPointsIncreased, EvtPointsReset, EvtUserRankChanged, PointsDecreasedEvent, PointsIncreasedEvent, PointsResetEvent, UserRankChangedEvent } from "src/share/event/loyalty.evt";

@Controller()
export class NotificationConsumer implements OnModuleInit {
    constructor(
        @Inject(NOTIFICATION_SERVICE) private readonly notificationService: NotificationService,
    ) {}
    
    async onModuleInit() {
        this.subscribe();
    }

    subscribe() {
        console.log('--- NOTIFICATION CONSUMER ĐANG KHỞI ĐỘNG ---');

        // ORDER Modules
        // Lắng nghe sự kiện tạo đơn hàng mới
        RabbitMQClient.getInstance().subscribe(
            EvtOrderCreated,
            async (event: any) => {
                const evt = OrderCreatedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN TẠO ĐƠN HÀNG ---', evt);

                if (evt.payload.status === 'pending') {
                    // Tạo thông báo cho nhân viên và quản lý khi có đơn hàng mới
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.ADMIN },
                        {
                            title: 'Đơn hàng mới',
                            content: `Đơn hàng #${evt.payload.orderId} đã được tạo. Vui lòng kiểm tra và xử lý đơn hàng.`,
                            role: UserRole.STAFF,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho khách hàng
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đơn hàng của bạn đã được tạo',
                            content: `Đơn hàng #${evt.payload.orderId} của bạn đã được tạo thành công. Vui lòng chờ nhân viên xác nhận.`,
                            userId: evt.payload.userId,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );
                }

                if (evt.payload.status === 'confirmed') {
                    // Tạo thông báo cho khách hàng khi đơn hàng được nhân viên tạo thành công
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đơn hàng của bạn đã được xác nhận',
                            content: `Đơn hàng #${evt.payload.orderId} của bạn đã được nhân viên tạo thành công. Món ăn đang được chuẩn bị. Vui lòng chờ trong giây lát.`, 
                            userId: evt.payload.userId, 
                            type: NotificationType.ORDER,   
                            refType: evt.payload.changeType,    
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );  

                    // Tạo thông báo cho nhân viên và quản lý khi có đơn hàng mới
                    await this.notificationService.createNotification(  
                        { sub: 'system', role: UserRole.ADMIN },    
                        {
                            title: 'Đơn hàng đã được xác nhận',
                            content: `Đơn hàng #${evt.payload.orderId} đã được nhân viên tạo thành công. Vui lòng kiểm tra và xử lý đơn hàng.`,   
                            role: UserRole.STAFF,   
                            type: NotificationType.ORDER,    
                            refType: evt.payload.changeType,    
                            refId: evt.payload.orderId, 
                        },  
                        'system',    
                        'system',    
                    );

                    // Tạo thông báo cho bếp
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.KITCHEN },
                        {
                            title: 'Đơn hàng mới cần chuẩn bị',
                            content: `Đơn hàng #${evt.payload.orderId} đã nhân viên tạo thành công và cần được chuẩn bị. Vui lòng kiểm tra và bắt đầu chuẩn bị món ăn.`, 
                            role: UserRole.KITCHEN,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );
                }   
            }
        );

        // Lắng nghe sự kiện cập nhật đơn hàng
        RabbitMQClient.getInstance().subscribe(
            EvtOrderUpdated,
            async (event: any) => {
                const evt = OrderUpdatedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN CẬP NHẬT ĐƠN HÀNG ---', evt);

                // Tạo thông báo cho khách hàng khi đơn hàng được cập nhật
                if (evt.payload.status === 'confirmed') {
                    // Tạo thông báo cho khách hàng khi đơn hàng được nhân viên xác nhân
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đơn hàng của bạn đã được xác nhận',
                            content: `Đơn hàng #${evt.payload.orderId} của bạn đã được nhân viên xác nhận. Món ăn đang được chuẩn bị. Vui lòng chờ trong giây lát.`,
                            userId: evt.payload.userId,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',   
                        'system', 
                    );  

                    // Tạo thông báo cho bếp
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.KITCHEN },
                        {
                            title: 'Đơn hàng cần chuẩn bị',
                            content: `Đơn hàng #${evt.payload.orderId} đã được nhân viên xác nhận và cần được chuẩn bị. Vui lòng kiểm tra và bắt đầu chuẩn bị món ăn.`,
                            role: UserRole.KITCHEN,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );
                }
                if (evt.payload.status === 'processing') {
                    // Tạo thông báo cho khách hàng khi đơn hàng đang được chuẩn bị
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đơn hàng của bạn đang được chuẩn bị',
                            content: `Đơn hàng #${evt.payload.orderId} của bạn đang được chuẩn bị. Vui lòng chờ trong giây lát.`,
                            userId: evt.payload.userId,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho nhân viên khi đơn hàng đang được chuẩn bị
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.STAFF },
                        {
                            title: 'Đơn hàng đang được chuẩn bị',
                            content: `Đơn hàng #${evt.payload.orderId} đang được chuẩn bị. Vui lòng kiểm tra tiến độ và sẵn sàng phục vụ khách hàng khi món ăn đã hoàn thành.`,
                            role: UserRole.STAFF,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );
                }
                if (evt.payload.status === 'served') {
                    // Tạo thông báo cho khách hàng khi đơn hàng đã xong món 
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đơn hàng của bạn đã sẵn sàng',
                            content: `Đơn hàng #${evt.payload.orderId} của bạn đã được chuẩn bị xong và đang được phục vụ. Vui lòng chuẩn bị thanh toán khi nhân viên đến bàn bạn.`,
                            userId: evt.payload.userId,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho nhân viên khi đơn hàng đã xong món 
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.STAFF },
                        {
                            title: 'Đơn hàng đã sẵn sàng phục vụ',
                            content: `Đơn hàng #${evt.payload.orderId} đã được chuẩn bị xong và đang được phục vụ. Vui lòng chuẩn bị thanh toán khi nhân viên đến bàn khách hàng.`,
                            role: UserRole.STAFF,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );
                }
                if (evt.payload.status === 'cancelled') {
                    // Tạo thông báo cho khách hàng khi đơn hàng bị hủy
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đơn hàng của bạn đã bị hủy',
                            content: `Đơn hàng #${evt.payload.orderId} của bạn đã bị hủy. Nếu bạn có thắc mắc, vui lòng liên hệ với nhân viên để được hỗ trợ.`,
                            userId: evt.payload.userId,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho nhân viên khi đơn hàng bị hủy
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.STAFF },
                        {
                            title: 'Đơn hàng đã bị hủy',
                            content: `Đơn hàng #${evt.payload.orderId} đã bị hủy. Vui lòng kiểm tra lý do hủy và liên hệ với khách hàng nếu cần thiết.`,
                            role: UserRole.STAFF,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho bếp khi đơn hàng bị hủy
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.KITCHEN },
                        {
                            title: 'Đơn hàng đã bị hủy',
                            content: `Đơn hàng #${evt.payload.orderId} đã bị hủy. Vui lòng kiểm tra lý do hủy và ngừng chuẩn bị món ăn nếu bạn đang chuẩn bị.`,
                            role: UserRole.KITCHEN,
                            type: NotificationType.ORDER,
                            refType: evt.payload.changeType,
                            refId: evt.payload.orderId,
                        },
                        'system',
                        'system',
                    );
                }
            }
        );

        // Lắng nghe sự kiện thanh toán đơn hàng
        RabbitMQClient.getInstance().subscribe(
            EvtPaymentCreated,
            async (event: any) => {
                const evt = PaymentCreatedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN THANH TOÁN ---', evt);
                
                if (evt.payload.status === 'success') {
                    // Tạo thông báo cho khách hàng khi thanh toán thành công
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Thanh toán thành công',
                            content: `Thanh toán cho đơn hàng #${evt.payload.orderId} của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                            userId: evt.payload.userId,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho nhân viên khi có thanh toán mới
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.STAFF },
                        {
                            title: 'Đơn hàng đã được thanh toán',
                            content: `Đơn hàng #${evt.payload.orderId} đã được khách hàng thanh toán thành công. Vui lòng kiểm tra và chuẩn bị đơn hàng để phục vụ khách hàng.`,
                            role: UserRole.STAFF,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho quản lý khi có thanh toán mới
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.ADMIN },
                        {
                            title: 'Đơn hàng đã được thanh toán',
                            content: `Đơn hàng #${evt.payload.orderId} đã được khách hàng thanh toán thành công. Vui lòng kiểm tra và chuẩn bị đơn hàng để phục vụ khách hàng.`,
                            role: UserRole.ADMIN,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );

                }
            }
        )

        // lắng nghe sự kiện cập nhật thanh toán đơn hàng
        RabbitMQClient.getInstance().subscribe(
            EvtPaymentUpdated, 
            async (event: any) => {
                const evt = PaymentUpdatedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN CẬP NHẬT THANH TOÁN ---', evt);

                if (evt.payload.status === 'failed') {
                    // Tạo thông báo cho khách hàng khi thanh toán thất bại
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Thanh toán thất bại',
                            content: `Thanh toán cho đơn hàng #${evt.payload.orderId} của bạn đã thất bại. Vui lòng thử lại hoặc liên hệ với nhân viên để được hỗ trợ.`,
                            userId: evt.payload.userId,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho nhân viên khi có thanh toán thất bại
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.STAFF },
                        {
                            title: 'Thanh toán thất bại',
                            content: `Đơn hàng #${evt.payload.orderId} đã có thanh toán thất bại. Vui lòng kiểm tra và liên hệ với khách hàng để hỗ trợ giải quyết vấn đề thanh toán.`,
                            role: UserRole.STAFF,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho quản lý khi có thanh toán thất bại
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.ADMIN },
                        {
                            title: 'Thanh toán thất bại',
                            content: `Đơn hàng #${evt.payload.orderId} đã có thanh toán thất bại. Vui lòng kiểm tra và liên hệ với khách hàng để hỗ trợ giải quyết vấn đề thanh toán.`,
                            role: UserRole.ADMIN,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );
                }

                if (evt.payload.status === 'success') {
                    // Tạo thông báo cho khách hàng khi thanh toán thành công
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {   title: 'Thanh toán thành công',
                            content: `Thanh toán cho đơn hàng #${evt.payload.orderId} của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                            userId: evt.payload.userId,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );

                    // Tạo thông báo cho nhân viên khi có thanh toán mới
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.STAFF },
                        {
                            title: 'Đơn hàng đã được thanh toán',
                            content: `Đơn hàng #${evt.payload.orderId} đã được khách hàng thanh toán thành công. Vui lòng kiểm tra và chuẩn bị đơn hàng để phục vụ khách hàng.`,
                            role: UserRole.STAFF,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );      

                    // Tạo thông báo cho quản lý khi có thanh toán mới
                    await this.notificationService.createNotification(
                        { sub: 'system', role: UserRole.ADMIN },
                        {
                            title: 'Đơn hàng đã được thanh toán',
                            content: `Đơn hàng #${evt.payload.orderId} đã được khách hàng thanh toán thành công. Vui lòng kiểm tra và chuẩn bị đơn hàng để phục vụ khách hàng.`,
                            role: UserRole.ADMIN,
                            type: NotificationType.PAYMENT,
                            refType: evt.payload.changeType,
                            refId: evt.payload.paymentId,
                        },
                        'system',
                        'system',
                    );
                }
            }
        );

        // lắng nghe sự kiện đặt bàn mới 
        RabbitMQClient.getInstance().subscribe(
            EvtReservationCreated,
            async (event: any) => {
                const evt = ReservationCreatedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN ĐẶT BÀN ---', evt);

                // Tạo thông báo cho nhân viên và quản lý khi có đặt bàn mới
                await this.notificationService.createNotification(
                    { sub: 'system', role: UserRole.ADMIN },
                    {
                        title: 'Đặt bàn mới',
                        content: `Có một đặt bàn mới từ khách hàng ${evt.payload.customerName} vào lúc ${evt.payload.time}. Vui lòng kiểm tra và xác nhận đặt bàn.`,
                        role: UserRole.STAFF,
                        type: NotificationType.RESERVATION,
                        refType: evt.payload.changeType,
                        refId: evt.payload.reservationId,
                    },
                    'system',
                    'system',
                );

                await this.notificationService.createNotification(
                    { sub: 'system', role: UserRole.STAFF },
                    {
                        title: 'Đặt bàn mới',
                        content: `Có một đặt bàn mới từ khách hàng ${evt.payload.customerName} vào lúc ${evt.payload.time}. Vui lòng kiểm tra và xác nhận đặt bàn.`,
                        role: UserRole.STAFF,
                        type: NotificationType.RESERVATION,
                        refType: evt.payload.changeType,
                        refId: evt.payload.reservationId,
                    },
                    'system',
                    'system',
                );

                // Tạo thông báo cho khách hàng khi đặt bàn thành công  
                await this.notificationService.createNotification(
                    { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                    {
                        title: 'Đặt bàn của bạn đã được nhận',
                        content: `Cảm ơn bạn ${evt.payload.customerName} đã đặt bàn tại nhà hàng của chúng tôi vào lúc ${evt.payload.time}. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đặt bàn.`,
                        userId: evt.payload.userId,
                        type: NotificationType.RESERVATION,
                        refType: evt.payload.changeType,
                        refId: evt.payload.reservationId,
                    },
                    'system',
                    'system',
                );
            }
        );

        // lắng nghe sự kiện cập nhật đặt bàn
        RabbitMQClient.getInstance().subscribe(
            EvtReservationUpdated,
            async (event: any) => {
                const evt = ReservationUpdatedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN CẬP NHẬT ĐẶT BÀN ---', evt);

                // Tạo thông báo cho khách hàng khi đặt bàn được xác nhận
                if (evt.payload.status === 'confirmed') {
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đặt bàn của bạn đã được xác nhận',
                            content: `Đặt bàn của bạn vào lúc ${evt.payload.time} đã được nhà hàng xác nhận. Chúng tôi rất mong được phục vụ bạn!`,
                            userId: evt.payload.userId,
                            type: NotificationType.RESERVATION,
                            refType: evt.payload.changeType,
                            refId: evt.payload.reservationId,
                        },
                        'system',
                        'system',
                    );
                }

                // Tạo thông báo cho khách hàng khi đặt bàn bị hủy
                if (evt.payload.status === 'cancelled') {
                    await this.notificationService.createNotification(
                        { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                        {
                            title: 'Đặt bàn của bạn đã bị hủy',
                            content: `Đặt bàn của bạn vào lúc ${evt.payload.time} đã bị hủy. Nếu bạn có thắc mắc, vui lòng liên hệ với nhà hàng để được hỗ trợ.`,
                            userId: evt.payload.userId,
                            type: NotificationType.RESERVATION,
                            refType: evt.payload.changeType,
                            refId: evt.payload.reservationId,
                        },
                        'system',
                        'system',
                    );
                }
            }
        );

        // Lắng nghe sự kiện nhận điểm thưởng mới
        RabbitMQClient.getInstance().subscribe(
            EvtPointsIncreased,
            async (event: any) => {
                const evt = PointsIncreasedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN TĂNG ĐIỂM THƯỞNG ---', evt);

                // Tạo thông báo cho khách hàng khi điểm thưởng được tăng
                await this.notificationService.createNotification(
                    { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                    {
                        title: 'Bạn đã nhận được điểm thưởng mới!',
                        content: `Bạn vừa nhận được ${evt.payload.points} điểm thưởng mới. Tổng điểm thưởng của bạn hiện là ${evt.payload.points}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                        userId: evt.payload.userId, 
                        type: NotificationType.PROMOTION, 
                        refType: 'POINTS_INCREASED',
                        refId: evt.payload.userId,
                    },
                    'system',
                    'system',
                );
            }    
        )

        // Lắng nghe sự kiện điểm thưởng bị giảm
        RabbitMQClient.getInstance().subscribe(
            EvtPointsDecreased,
            async (event: any) => {
                const evt = PointsDecreasedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN GIẢM ĐIỂM THƯỞNG ---', evt);

                // Tạo thông báo cho khách hàng khi điểm thưởng bị giảm
                await this.notificationService.createNotification(
                    { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                    {
                        title: 'Điểm thưởng của bạn đã bị giảm',
                        content: `Bạn vừa bị trừ ${evt.payload.points} điểm thưởng. Tổng điểm thưởng của bạn hiện là ${evt.payload.points}. Nếu bạn có thắc mắc, vui lòng liên hệ với nhà hàng để được hỗ trợ.`,
                        userId: evt.payload.userId, 
                        type: NotificationType.PROMOTION, 
                        refType: 'POINTS_DECREASED',
                        refId: evt.payload.userId,
                    },
                    'system',
                    'system',   
                );
            }
        );

        // Lắng nghe sự kiện điểm thưởng bị reset
        RabbitMQClient.getInstance().subscribe(
            EvtPointsReset,
            async (event: any) => {
                const evt = PointsResetEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN RESET ĐIỂM THƯỞNG ---', evt);

                // Tạo thông báo cho khách hàng khi điểm thưởng bị reset
                await this.notificationService.createNotification(
                    { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                    {
                        title: 'Điểm thưởng của bạn đã bị reset',
                        content: `Điểm thưởng của bạn đã bị reset về 0. Nếu bạn có thắc mắc, vui lòng liên hệ với nhà hàng để được hỗ trợ.`,
                        userId: evt.payload.userId, 
                        type: NotificationType.PROMOTION, 
                        refType: 'POINTS_RESET',
                        refId: evt.payload.userId,
                    },
                    'system',
                    'system',   
                );
            }
        );

        // Lắng nghe sự kiện thay đổi hạng thành viên
        RabbitMQClient.getInstance().subscribe(
            EvtUserRankChanged,
            async (event: any) => {
                const evt = UserRankChangedEvent.from(event);
                console.log('--- NOTIFICATION CONSUMER NHẬN SỰ KIỆN THAY ĐỔI HẠNG THÀNH VIÊN ---', evt);

                // Tạo thông báo cho khách hàng khi hạng thành viên của họ thay đổi
                await this.notificationService.createNotification(
                    { sub: evt.payload.userId || 'system', role: UserRole.CUSTOMER },
                    {
                        title: 'Hạng thành viên của bạn đã thay đổi',
                        content: `Hạng thành viên của bạn đã được cập nhật từ ${evt.payload.rankName} lên ${evt.payload.rankChanges}. Cảm ơn bạn đã là khách hàng thân thiết của chúng tôi!`,
                        userId: evt.payload.userId, 
                        type: NotificationType.PROMOTION, 
                        refType: 'RANK_CHANGED',
                        refId: evt.payload.userId,
                    },
                    'system',
                    'system',   
                 );
            }
        )
    }
}