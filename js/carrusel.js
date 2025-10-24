const carousel = document.querySelector('.carousel');
const slides = document.querySelectorAll('.carousel-slide');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');

let index = 0;

const showSlide = () => {
  carousel.style.transform = `translateX(-${index * 100}%)`;
};

nextButton.addEventListener('click', () => {
  index = (index + 1) % slides.length;
  showSlide();
});

prevButton.addEventListener('click', () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide();
});

setInterval(() => {
  index = (index + 1) % slides.length;
  showSlide();
}, 5000);