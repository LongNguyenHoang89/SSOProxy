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
    var url = "https://localhost:3001"; //CONIKS Client address
    var method = "POST";
    var username = document.getElementById("username").value;
    var access_token = document.getElementById("access_token").value;
    var public_key = document.getElementById("public_key").value;
    var postData = `register ${username} ${access_token} ${public_key}`;

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
      displayErrorMsg(message)
      redirectToProfile()
    }

    request.onerror = function (err) {
      console.log(err)
      const message = 'An error occured at network level. Please check if ConiksClient is up.';
      displayErrorMsg(message)
      redirectToProfile()
    }

    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");

    //- Actually sends the request to the server.
    request.send(postData);
  }
  return false;
}

function displayErrorMsg(msg) {
  document.getElementById("coniks_register_form").reset();
  document.getElementById("error_div").innerHTML = `
    <ul>
      <li>${msg}</li>
      <li>You will be redirected to the profile page in a few seconds.</li>
    </ul>
  `;

}

function redirectToProfile() {
  setTimeout(function () {
    window.location.replace("/profile")
  }, 4000);
}
