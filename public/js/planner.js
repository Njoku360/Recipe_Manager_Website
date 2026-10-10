// Activate drag and drop functionality for recipes in the meal plan
document.addEventListener('DOMContentLoaded', () => {
    const recipechips = document.querySelectorAll('.recipe-chip')
    const dropzones = document.querySelectorAll('.dropzone')
    const form = document.getElementById('add-meal-form')
    const hiddenDay = document.getElementById('hidden-day')
    const hiddenRecipe = document.getElementById('hidden-recipe')
    const search = document.querySelector('input[placeholder="Search recipes..."]')

    // The dragged recipe chip should be stored in a variable so we can access it later
    let draggedId = null

    // Add event listeners to each recipe chip for drag events
    recipechips.forEach(chip => {
        chip.addEventListener('dragstart', (e) => {
            // Get the recipe ID from the data attribute of the dragged chip
            draggedId = chip.dataset.recipeId
            chip.classList.add('opacity-50')
            // Set the dataTransfer effect to 'copy' to indicate that the recipe can be copied to the dropzone
            e.dataTransfer.effectAllowed = 'copy'
        })

        chip.addEventListener('dragend', () => {
            // When the drag ends, reset the draggedRecipe variable and remove the opacity class from all chips
            chip.classList.remove('opacity-50')
        })
    })

    // Drag over
    dropzones.forEach(zone => {
        zone.addEventListener('dragover', e => {
            // required to allow drop
            e.preventDefault()
            zone.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-slate-700')    
        })
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-slate-700')
        })
    })

    // Handle the dropped recipe here 
    dropzones.forEach(zone => {
        zone.addEventListener('drop', e => {
            e.preventDefault() // Prevent the default behavior of the drop event
            zone.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-slate-700')

            if(!draggedId) return // If the user doesn't drag a recipe, exit the fuction or return nothing

            // Set the hidden input values to the dragged recipe ID and the dropzone's day
            hiddenDay.value = zone.dataset.day
            hiddenRecipe.value = draggedId
            form.submit() // add the mealplan that was dropped on a day to the database by POST
        })
    })

    // Search for a particular recipe/recipe search filter
    if(search){
        search.addEventListener('input', e => {
            // Get the value of the search input and convert it to lowercase for case-insensitive matching
            const q = e.target.value.toLowerCase()
            // Loop through each recipe chip and check if the name of the recipe includes the search query
            recipechips.forEach(chip => {
                // Get the text content of the recipe chip and convert it to lowercase for case-insensitive matching
                const text = chip.textContent.toLowerCase()
                // Show or hide the recipe chip based on whether it matches the search query
                chip.style.display = text.includes(q) ? '' : 'none'
            })
        })
    }
})