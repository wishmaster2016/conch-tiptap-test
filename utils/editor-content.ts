// Convert text to HTML to get highlight free text
export const convertTextToHTML = (originalHTML: String) => {
  let newHTML = originalHTML;

  // add <p> to start of newHTML
  newHTML = `<p>${newHTML}</p>`;

  // replace all \n\n with </p><p>
  newHTML = newHTML.replace(/\n\n/g, '</p><p>');

  return newHTML;
}

// Convert text to HTML to get highlight free text
export const convertBackendTextToHTML = (originalHTML: String) => {
  let newHTML = originalHTML;

  // add <p> to start of newHTML
  newHTML = `<p>${newHTML}</p>`;

  // replace all \n\n with </p><p>
  newHTML = newHTML.replace(/\n\n/g, '</p><p>');

  // replace all \n with </p><p>
  newHTML = newHTML.replace(/\n/g, '</p><p>');

  return newHTML;
}
