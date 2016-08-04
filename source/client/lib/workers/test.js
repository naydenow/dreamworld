/*
Тестовый воркер
*/

self.importScripts('three.js');

function Test(main) {
    this.main = main;
    this.main.on("t", function (data) {
         this.main.emit("t", data);
    }.bind(this));
}