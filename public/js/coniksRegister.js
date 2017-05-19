function isAlphanumeric() {
  text = document.getElementById("public_key").value;
  var pattern = /^[a-z0-9]+$/i;
  return pattern.test(text);
}

function coniksRegister() {
  var isAlphanumerical = this.isAlphanumeric();
  if (!isAlphanumerical) {
    document.getElementById("error_div").innerHTML = `
      <ul>
        <li>Invalid public key. Should be alphanumerical.</li>
      </ul>
    `;
  } else {
    document.getElementById("error_div").innerHTML = '';
    var url = "http://localhost:3001"; //CONIKS Client address
    var method = "POST";
    var username = document.getElementById("username").value;
    var public_key = document.getElementById("public_key").value;
    var postData = `register ${username} ${public_key}`;

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
        case 409:
          message = 'Successfully registered.';
          break;
        default:
          message = 'Something akward happened. Registration may have failed ...';
      }
      console.log(status);
      console.log(data)
      document.getElementById("error_div").innerHTML = `
        <ul>
          <li>${message}</li>
          <li>You will be redirected to the profile page in a few seconds.</li>
        </ul>
      `;
      setTimeout(function () {
        window.location.replace("/profile")
      }, 4000);
    }

    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");

    //- Actually sends the request to the server.
    request.send(postData);
  }
  return false;
}
