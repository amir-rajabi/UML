/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

document.getElementById("1to2").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("2-tab");
    var tabPane = document.getElementById("2-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});

document.getElementById("2to1").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("1-tab");
    var tabPane = document.getElementById("1-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});
document.getElementById("2to3").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("3-tab");
    var tabPane = document.getElementById("3-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});

document.getElementById("3to2").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("2-tab");
    var tabPane = document.getElementById("2-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});
document.getElementById("3to4").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("4-tab");
    var tabPane = document.getElementById("4-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});

document.getElementById("4to3").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("3-tab");
    var tabPane = document.getElementById("3-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});
document.getElementById("4to5").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("5-tab");
    var tabPane = document.getElementById("5-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});

document.getElementById("5to4").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("4-tab");
    var tabPane = document.getElementById("4-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});
document.getElementById("5to6").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("6-tab");
    var tabPane = document.getElementById("6-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});

document.getElementById("6to5").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("5-tab");
    var tabPane = document.getElementById("5-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});
document.getElementById("6to7").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("7-tab");
    var tabPane = document.getElementById("7-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});

document.getElementById("7to6").addEventListener("click", function() {
    deactivateOtherTabs();

    var tab = document.getElementById("6-tab");
    var tabPane = document.getElementById("6-tab-pane");
  
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tabPane.classList.add("show", "active");
    tabPane.setAttribute("aria-selected", "true");
});


function deactivateOtherTabs(){
    var activeTabPanes = document.querySelectorAll(".help-link");
    var activeTabPanesContent = document.querySelectorAll(".help-pane");
    for (var j = 0; j < activeTabPanes.length; j++) {
      var tabPane = activeTabPanes[j];
      tabPane.classList.remove("active");
      tabPane.setAttribute("aria-selected", "false");
    }
    for (var j = 0; j < activeTabPanesContent.length; j++) {
        var tabPane = activeTabPanesContent[j];
        tabPane.classList.remove("active", "show");
        tabPane.setAttribute("aria-selected", "false");
      }
}
  