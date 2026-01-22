document.addEventListener("DOMContentLoaded", function() {
    var interval = setInterval(function() {
      var topbarWrapper = document.querySelector('.topbar-wrapper');
      if (topbarWrapper) {
        console.log('Tìm thấy topbar-wrapper');
        console.log(topbarWrapper);
        topbarWrapper.innerHTML = `
            <img src="/assets/logo.png" alt="Baso Spark Logo" style="width: 50px; height: 50px; margin: 10px 0;">
            <h3 style="color: white">Smart POS</h3>
        `;

        clearInterval(interval); 
      } else {
        console.log('Không tìm thấy topbar-wrapper');
      }
    }, 100); 
});