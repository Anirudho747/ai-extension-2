// Tab switching logic
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-button').forEach(button => {
   //Attaches a click event listener to each .tab-button
    button.addEventListener('click', () => {
      // Removes the active class from all buttons (so only one button appears active at a time)
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      //Adds the active class to the clicked button
      button.classList.add('active');
      // Selects all elements with the .tab-content class
      //Removes the active class from all tabs (hides all tabs initially).
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      // Retrieves the tab ID stored in the clicked button's data-tab attribute.
      // Example: If the button has data-tab="home", it looks for an element with id="homeTab".
      // Adds the active class to that specific tab, making it visible.
      document.getElementById(button.dataset.tab + 'Tab').classList.add('active');
    });
  });
}); 