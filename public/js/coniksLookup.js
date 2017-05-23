function coniksLookup() {
  var url = "http://localhost:3001"; //CONIKS Client address
  var method = "POST";
  var username = document.getElementById("username").value;
  var postData = `lookup ${username}`;

  var async = true;

  var request = new XMLHttpRequest();
  request.onload = function () {
    var status = request.status; // HTTP response status
    var data = request.responseText; // Returned data
    var message = '';
    switch (status) {
      case 500:
        message = 'CONIKS server internal error. Please check the status of the server.';
        break;
      case 200:
        let pattern = /^.+\[(.+)\]\n$/i;
        let match = pattern.exec(data);
        if (match && match[1]) {
          let pub_key = match[1];
          var ul = document.getElementById('pub_keys');
          var isPresent = isUsernameInUL(ul, username);
          if (!isPresent) {
            let newLi = document.createElement('li');
            let text = `${username} : ${pub_key}`;
            newLi.textContent = text;
            ul.appendChild(newLi);
          }
        } else {
          message = `The lookup worked but the parsing of the response failed for an unknown reason ...`
        }
        break;
      case 404:
        message = `${username} is not registered ...`;
        break;
      default:
        message = 'Something akward happened. Lookup may have failed ...';
    }
    if (message) {
      document.getElementById("error_div").innerHTML = `
        <ul>
          <li>${message}</li>
        </ul>
      `;
    } else {
      var form = document.getElementById("coniks_lookup_form");
      form.reset();
    }
  }
  request.open(method, url, async);

  request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");

  //- Actually sends the request to the server.
  request.send(postData);
  return false;
}

function isUsernameInUL(ulElement, username) {
  var items = ulElement.getElementsByTagName("li");
  var found = false;
  var i = 0;
  while (!found && i < items.length) {
    let text = items[i].textContent;
    let itemUsernamePubKey = text.split(" : ");
    let itemUsername = itemUsernamePubKey[0];
    if (itemUsername === username) {
      console.log(`${username}'s binding has changed ?`);
      found = true;
    }
    i++;
  }
  return found;
}
