export function showSuccessSlide(slides) {
  // We're expecting there to be just two of them even 
  // though the system is primed for more if needed.
  slides[0].className = 'past';
  slides[1].className = 'present';
}

export function setLoading(element, isLoading) {
  element.style.display = isLoading ? 'block' : '';
  if (isLoading) 
    document.body.setAttribute('data-overlay', true);
  else 
    document.body.removeAttribute('data-overlay');
}