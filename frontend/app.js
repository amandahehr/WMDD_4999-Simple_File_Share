'use strict';
const API_URL = "<your api url>";

(() => {


  const sendImage = document.getElementById('sendButton');
  const updateTable = document.getElementById('updateTable');
  const postResponse = document.getElementById('postResponse');
  const table = document.getElementById('table');

  postResponse.style.display = 'none';

  updateTable.addEventListener('click', () => {
    postResponse.style.display = 'none';
    getRequest();
  });

  sendImage.addEventListener('click', () => {
    saveImage();
  });

})();

function getRequest() {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.status === 200) {
            displayResponse(this.response);
        }
    };
    xhttp.open('GET', API_URL, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function displayResponse(response) {
    let jsonResponse = JSON.parse(response);
    var rows = [];
    DeleteRows();
    jsonResponse.Items.forEach(item => {
        rows.push(`<tr> \
            <td>${item.filename}</td> \
            <td>$${item.description}</td> \
        </tr>`);
    });
    $('table.table').append(rows.join());
}

function saveImage() {

    let url = document.getElementById('imageUrl');
    var array = url.value.split('/');
    var filename = array[array.length-1];
    let description = document.getElementById('description');

    let body = {};
    body.imageurl = url.value;
    body.key = filename;
    body.description = description.value;

    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        postResponse.style.display = 'block';
        postResponse.innerHTML = "Update the list to see your addition!";
    };

    xhttp.open('POST', API_URL);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(body));
}

function DeleteRows() {
    var rowCount = table.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}
