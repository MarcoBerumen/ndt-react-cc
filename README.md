# Coding Challenge

Your task is to finish the Redux `mapStateToProps` function to a program to help an accountant to get balances from accounting journals.

## Getting started

Install modules by running `npm install` in the command line, then `npm run start`.

## Inputs & Outputs

Journal and Accounts input fields are already parsed and stored in the app's
Redux store.

User input has the following form:

    AAAA BBBB CCC-YY DDD-YY EEE

- AAAA is the starting account (* means first account of source file)
- BBBB is the ending account(* means last account of source file)
- CCC-YY is the first period (* means first period of source file)
- DDD-YY is the last period (* means last period of source file)
- EEE is output format (values can be HTML or CSV).

Examples of user inputs:

    1000 5000 MAR-16 JUL-16 HTML

This user request must output all accounts from acounts starting with "1000" to accounts starting with "5000", from period MAR-16 to JUL-16. Output should be formatted as an HTML table.

![1000 5000 MAR-16 JUL-16 HTML](/example-1.png)

    2000 * * MAY-16 CSV

This user request must output all accounts from accounts starting with "2000" to last account from source file, from first period of file to MAY-16. Output should be formatted as CSV.

![2000 * * MAY-16 CSV](/example-2.png)

## Challenge

Parsing input fields and storing in Redux has already been implemented; it's up to you to filter the journals and accounts to create the balance data set. This code should go into the selector function at the bottom of the BalanceOutput component. The BalanceOutput component expects balance to be an array of objects with the keys: ACCOUNT, DESCRIPTION, DEBIT, CREDIT, and BALANCE.

## Post challenge

After you're done, commit your changes, push to your GitHub and send us a link.


*************** *************** REACT CODE CHALLENGE*************** ***************
 Thank you for your submission! To help you achieve a 100% on this challenge, here are some detailed suggestions across each area of the evaluation: ⸻ 
 
 -1. Visual Fidelity • Make sure the user interface matches the provided screenshots or design exactly. • Pay attention to spacing between elements, font sizes, text alignment, and padding. • If you’re using plain CSS, consider using a utility-first CSS framework like Tailwind to enforce consistent spacing and styling. • Verify that headings, labels, and content areas are visually aligned and proportioned like the examples. ⸻ 
 
 -2. Responsiveness • Ensure your UI adjusts gracefully across all screen sizes, especially mobile and tablet. • Use media queries to modify layouts (e.g., stack form and output sections vertically on small screens). • Use CSS Flexbox or Grid to ensure content can adapt and doesn’t overflow or break on smaller devices. • Test with browser resizing and dev tools (e.g., Chrome’s device simulator). ⸻ 
 
 -3. Accessibility & Usability • Use semantic HTML elements like <form>, <label>, <fieldset>, <main>, etc. • Link <label> elements with their corresponding <input> fields using the htmlFor attribute. • Make all interactive elements (inputs, buttons) accessible using only the keyboard (Tab, Enter). • Add ARIA roles and aria-labels where applicable to help screen readers understand the layout. • Ensure color contrast is sufficient for readability. ⸻ 
 
 4. Core Feature Completion • Confirm the app can interpret all valid formats of the input string as defined in the prompt. • Validate corner cases such as using * for first/last period or account. • Handle ranges of accounts and periods correctly and ensure output formatting is accurate for both HTML and CSV. • If time allows, add sample outputs for each case to validate the results. ⸻ 
 
 5. State Management • You’re using Redux, which is great. Ensure all input processing and balance calculations are managed via Redux actions and reducers. • Keep Redux state cleanly organized and avoid placing state logic inside components. • Consider using selectors for derived data (e.g., filtered accounts), which helps separate logic from rendering. ⸻ 
 
 6. Data Flow & Interactivity • Ensure each input change correctly updates state and the output responds immediately. • Display meaningful loading or processing indicators if the computation is heavy. • Disable the submit button until the input is valid to avoid unnecessary processing. ⸻ 
 
 7. Component Design & Reusability • Break down components into smaller units with a single responsibility (e.g., a separate OutputTable or ErrorDisplay). • Avoid mixing display logic with input parsing or data transformation inside components. • Move repeated or shared logic into helper functions or utility modules. ⸻ 
 
 8. Code Style & Consistency • Use a linter like ESLint and a formatter like Prettier to maintain consistent code style. • Stick to consistent naming patterns (camelCase for variables, PascalCase for components). • Remove unused code or commented-out blocks. • Keep files short and well-organized. ⸻ 
 
 9. Test Coverage & Quality • Add unit tests using Jest and React Testing Library. • Write tests for at least: • Rendering of main components with different props. • Input parsing logic with various formats. • Redux reducer logic and actions. • Include edge case tests (e.g., missing input fields, malformed input). ⸻ 
 
 10. Error Handling • Add validation for user input to catch invalid formats or logical issues (e.g., end date before start date). • Show clear, user-friendly error messages when input is incorrect or incomplete. • Reset or clear output and errors appropriately between submissions. ⸻ 
 
 11. README & Setup • Expand the README to include: • Project purpose and feature summary. • Installation steps (what version of Node, if Yarn or NPM should be used). • A short explanation of the project structure. • Screenshots or sample inputs/outputs. • Known limitations or future improvements. ⸻ 
 
 12. Modularity & Maintainability • Create a clear folder structure like: src/ components/ redux/ actions/ reducers/ selectors.js utils/ App.js • Move any parsing or formatting logic to utility files (utils.js) so components stay clean. • Add inline comments explaining key logic, especially around how the input string is parsed and how the filtering works. 
 
 Following these steps will make your app more robust, scalable, and aligned with professional best practices. Great job so far—you’re close to a polished, production-ready solution!