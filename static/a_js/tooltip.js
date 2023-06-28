const elements = document.getElementsByClassName('tooltip-button');

for (let i = 0; i < elements.length; i++) {
const element = elements[i];
const options = {
    delay: { show: 200, hide: 200 },
    animation: true,
};
const tooltip = new bootstrap.Tooltip(element, options);
}