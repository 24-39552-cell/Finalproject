(function () {
  var form = document.getElementById("login"),
    user = document.getElementById("user"),
    pass = document.getElementById("pass"),
    err = document.getElementById("error"),
    btn = document.getElementById("submit"),
    label = document.getElementById("label"),
    tog = document.getElementById("toggle"),
    note = document.getElementById("note");

  tog.addEventListener("click", function () {
    var show = pass.type === "password";
    pass.type = show ? "text" : "password";
    tog.setAttribute("aria-pressed", String(show));
    tog.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });

  var dlg = document.getElementById("forgotDlg"),
    ff = document.getElementById("forgotForm"),
    fe = document.getElementById("femail"),
    fmsg = document.getElementById("fmsg");
  document.getElementById("forgot").addEventListener("click", function () {
    fmsg.className = "";
    fmsg.textContent = "";
    fe.removeAttribute("aria-invalid");
    dlg.showModal();
  });
  Array.prototype.forEach.call(
    dlg.querySelectorAll("[data-close]"),
    function (b) {
      b.addEventListener("click", function () {
        dlg.close();
      });
    },
  );
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) {
      dlg.close();
    }
  });
  /* Demo only: send the email to your server, which emails a reset link if the address is registered. */
  ff.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = fe.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
      fmsg.className = "error show";
      fmsg.textContent = "Enter a valid email address.";
      fe.setAttribute("aria-invalid", "true");
      fe.focus();
      return;
    }
    fe.removeAttribute("aria-invalid");
    fmsg.className = "ok show";
    fmsg.textContent =
      "If this email is registered, a password reset message has been sent.";
  });

  Array.prototype.forEach.call(
    document.querySelectorAll(".link[data-msg]"),
    function (b) {
      b.addEventListener("click", function () {
        note.textContent = b.getAttribute("data-msg");
      });
    },
  );

  function fail(msg, field) {
    err.textContent = msg;
    err.classList.add("show");
    user.removeAttribute("aria-invalid");
    pass.removeAttribute("aria-invalid");
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  }

  function connectionError() {
    return window.location.protocol === "file:"
      ? "PHP cannot run from a local file. Open this app at http://localhost/attendance-system/login.html using XAMPP."
      : "Could not reach the PHP login API. Open this project through XAMPP Apache and check that Apache and MySQL are running.";
  }

  function authenticate(u, p) {
    return fetch("api/auth.php?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p })
    })
      .then(function (r) {
        return r.text().then(function (body) {
          var data;
          try {
            data = JSON.parse(body);
          } catch (e) {
            return {
              ok: false,
              error: connectionError()
            };
          }
          if (!r.ok || !data.ok) {
            return {
              ok: false,
              error: data.error || "Email, username, or password is incorrect."
            };
          }
          sessionStorage.setItem("att_user", JSON.stringify(data));
          return data;
        });
      })
      .catch(function () {
        return {
          ok: false,
          error: connectionError()
        };
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.classList.remove("show");
    var u = user.value.trim(),
      p = pass.value;
    if (!u) {
      return fail("Enter your email or username.", user);
    }
    if (!p) {
      return fail("Enter your password.", pass);
    }
    btn.disabled = true;
    label.textContent = "Signing in…";
    authenticate(u, p).then(function (r) {
      btn.disabled = false;
      label.textContent = "Sign in";
      if (!r.ok) {
        pass.value = "";
        return fail(
          r.error || "Email, username, or password is incorrect. Check them and try again.",
          user
        );
      }
      label.textContent = "Signed in as " + r.role;
      setTimeout(function () {
        window.location.href =
          r.role === "Administrator" ? "admin.html" : "teacher.html";
      }, 400);
    });
  });
})();
