document.body.style.backgroundImage = `url('/my_images/background_${page}.jpg')`;

const element = document.getElementById(page);
if (element) element.classList.add("active");
