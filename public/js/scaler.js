/* Create the scaler for measuring the weight of Ingredients for a particular amount of people
user types in the input */
// Once the Dom is loaded, fire the function for creating weigth of Ingredients
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('servings')
    if(!input) return
    // The default servings(amount of people for the food) in the database
    const base = Number(input.dataset.base)
    // The quantity(number) of each ingredients
    const qtyEls = document.querySelectorAll('[data-qty]')

    // Get the quantity of each ingredients when the user types in a number a new number of servings
    input.addEventListener('input', () => {
        const factor = Number(input.value) / base
        qtyEls.forEach(el => {
            const original = Number(el.dataset.qty)
            const scaled = original * factor

            // Round the numbers nicely: Whole numbers stay whole, decimals go to 1 place
            el.textContent = Number.isInteger(scaled) ? scaled : scaled.toFixed(1)
        })
    })
})