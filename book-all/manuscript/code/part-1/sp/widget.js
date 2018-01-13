document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".widget button");
    var h2 = document.querySelector(".widget h2").classList;
    button.addEventListener("click", function () {
        h2.add("big");
        setTimeout(function () {
            h2.remove("big");
        }, 1000);
    });
});
