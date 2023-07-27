/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

const elements = document.getElementsByClassName('tooltip-button');

for (let i = 0; i < elements.length; i++) {
const element = elements[i];
const options = {
    delay: { show: 200, hide: 200 },
    animation: true,
};
const tooltip = new bootstrap.Tooltip(element, options);
}