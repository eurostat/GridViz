let loading_spinner;

/**
 * @description CSS3 animation spinner
 *@function createLoadingSpinner
 */
export function createLoadingSpinner(container, type) {
  loading_spinner = document.createElement("div");
  loading_spinner.id = "gridviz-loading-spinner";
  loading_spinner.classList.add("lds-" + type);
  let child1 = document.createElement("div");
  loading_spinner.appendChild(child1);
  let child2 = document.createElement("div");
  loading_spinner.appendChild(child2);
  let child3 = document.createElement("div");
  loading_spinner.appendChild(child3);
  let child4 = document.createElement("div");
  loading_spinner.appendChild(child4);
  container.appendChild(loading_spinner);
}

/**
 *@function showLoading
 * @description show loading spinner
 */
export function showLoading() {
  loading_spinner.style.display = "block";
}

/**
 * @description hide loading spinner
 * @function hideLoading
 */
export function hideLoading() {
  loading_spinner.style.display = "none";
}

/**
 * @description returns number with space as separator
 * @function formatNumber
 */
export function formatNumber(n) {
  return n
    .toLocaleString("en")
    .replace(/,/gi, " ")
}
