(function () {
  var $ = function (s) {
    return document.querySelector(s);
  };
  var e = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  var p2 = function (n) {
    return ("0" + n).slice(-2);
  };
  var dstr = function (d) {
    return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
  };
  var hm = function () {
    var d = new Date();
    return p2(d.getHours()) + ":" + p2(d.getMinutes());
  };
  var TODAY = dstr(new Date()),
    KEY = "att_teacher_v1",
    CLS = "Grade 10 – Rizal",
    ME = "Maria Santos";
  var AUTH = null;
  try {
    AUTH = JSON.parse(sessionStorage.getItem("att_user"));
  } catch (x) {}
  var NAV = [
    ["dash", "Dashboard"],
    ["stu", "My Students"],
    ["bio", "Biometric Registration"],
    ["att", "Attendance"],
    ["schedule", "Class Schedule"],
    ["rep", "Reports"],
  ];
  var ST = ["Present", "Late", "Absent", "Excused"];
  var CL = {
    Present: "ok",
    Late: "warn",
    Absent: "bad",
    Excused: "info",
    Active: "ok",
    Inactive: "bad",
    Yes: "ok",
    No: "warn",
  };
  var bd = function (t) {
    return (
      '<span class="b" style="--c:var(--' + CL[t] + ')">' + e(t) + "</span>"
    );
  };

  var seed = 7;
  function R() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  function build() {
    var SEC = [
      "Grade 10 – Rizal",
      "Grade 10 – Bonifacio",
      "Grade 11 – Mabini",
      "Grade 12 – Luna",
    ];
    var FN = [
      "Juan",
      "Maria",
      "Jose",
      "Ana",
      "Pedro",
      "Liza",
      "Carlo",
      "Rina",
      "Miguel",
      "Sofia",
      "Paolo",
      "Bea",
    ];
    var LN = [
      "Dela Cruz",
      "Santos",
      "Reyes",
      "Garcia",
      "Ramos",
      "Mendoza",
      "Torres",
      "Flores",
    ];
    var s = { set: { late: "07:45" }, stu: [], att: [], log: [], n: 1, sn: 25 };
    for (var i = 0; i < 24; i++)
      s.stu.push({
        id: "S-2026-" + ("00" + (i + 1)).slice(-3),
        n: FN[i % 12] + " " + LN[(i * 3) % 8],
        sec: SEC[i % 4],
        ok: true,
        face: R() > 0.12,
        fp: R() > 0.2,
      });
    for (var k = 29; k >= 0; k--) {
      var d = new Date();
      d.setDate(d.getDate() - k);
      if (k && d.getDay() % 6 === 0) continue;
      var dd = dstr(d);
      s.stu.forEach(function (u) {
        if (!k && R() < 0.35) return;
        var x = R(),
          t = "—",
          m = "Manual",
          st =
            x < 0.72
              ? "Present"
              : x < 0.88
                ? "Late"
                : x < 0.95
                  ? "Absent"
                  : "Excused";
        if (st === "Present") t = "07:" + p2(10 + ((R() * 34) | 0));
        if (st === "Late") t = "07:" + p2(46 + ((R() * 13) | 0));
        if (t !== "—") m = R() < 0.8 ? "Facial Recognition" : "Fingerprint";
        s.att.push({
          id: "A-" + s.n++,
          sid: u.id,
          date: dd,
          time: t,
          st: st,
          m: m,
          dev: t !== "—" ? "DEV-0" + (1 + ((R() * 2) | 0)) : "—",
        });
      });
    }
    return s;
  }
  var S;
  var SCHEDULES = [];
  try {
    S = JSON.parse(localStorage.getItem(KEY));
  } catch (x) {}
  if (!S) S = build();
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (x) {}
  }
  function lg(a, d) {
    S.log.unshift({ t: TODAY + " " + hm(), u: ME, a: a, d: d, r: "Success" });
    save();
  }

  /* Every read goes through these, so the teacher only ever sees their own class */
  var mine = function () {
    return S.stu.filter(function (x) {
      return x.sec === CLS;
    });
  };
  var mineAtt = function () {
    var ids = mine().map(function (x) {
      return x.id;
    });
    return S.att.filter(function (a) {
      return ids.indexOf(a.sid) >= 0;
    });
  };
  var own = function (id) {
    return mine().filter(function (x) {
      return x.id === id;
    })[0];
  };
  var sname = function (id) {
    return own(id).n;
  };
  var btn = function (a, id, t) {
    return (
      '<button class="sb" data-a="' +
      a +
      '" data-id="' +
      id +
      '">' +
      t +
      "</button>"
    );
  };
  function tbl(h, rows) {
    return (
      '<div class="tw"><table><thead><tr>' +
      h
        .map(function (x) {
          return "<th>" + x + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      (rows.length
        ? rows
            .map(function (r) {
              return (
                "<tr>" +
                r
                  .map(function (c) {
                    return "<td>" + c + "</td>";
                  })
                  .join("") +
                "</tr>"
              );
            })
            .join("")
        : '<tr><td colspan="' +
          h.length +
          '" class="mut">No records found.</td></tr>') +
      "</tbody></table></div>"
    );
  }
  function sel(k, l, o, v) {
    return (
      '<select data-f="' +
      k +
      '" aria-label="' +
      l +
      '"><option value="">' +
      l +
      "</option>" +
      o
        .map(function (x) {
          return (
            "<option" + (x === v ? " selected" : "") + ">" + e(x) + "</option>"
          );
        })
        .join("") +
      "</select>"
    );
  }
  function inp(k, ph, t, v) {
    return (
      '<input data-f="' +
      k +
      '" type="' +
      (t || "search") +
      '" placeholder="' +
      ph +
      '" aria-label="' +
      ph +
      '" value="' +
      e(v || "") +
      '">'
    );
  }
  function stat(l, v, c) {
    return (
      '<div class="card stat" style="--c:var(--' +
      c +
      ')"><b>' +
      v +
      "</b><span>" +
      l +
      "</span></div>"
    );
  }
  var LAST = [];
  function toast(m, ms) {
    var t = $("#toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () {
      t.classList.remove("show");
    }, ms || 3000);
  }
  function scheduleRequest(path, options) {
    options = options || {};
    options.credentials = "include";
    options.headers = options.headers || {};
    if (AUTH && AUTH.token) options.headers["X-Session-Token"] = AUTH.token;
    return fetch("api/" + path, options).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) throw new Error(data.error || "Schedule request failed.");
        return data;
      });
    });
  }
  function renderScheduleForm(sectionId) {
    var card = $("#schedule-card");
    if (!card) return;
    if (!SCHEDULES.length) {
      card.innerHTML =
        '<h2>Class attendance schedule</h2><p class="mut">No class is assigned to this teacher account. Ask an administrator to assign a class before setting its schedule.</p>';
      return;
    }
    var selected = SCHEDULES.filter(function (item) {
      return String(item.section_id) === String(sectionId);
    })[0] || SCHEDULES[0];
    card.innerHTML =
      '<h2>Class attendance schedule</h2>' +
      '<p class="mut">Set your class start time and the time after which attendance is marked late.</p>' +
      '<form id="schedule-form">' +
      '<label for="schedule-section">Assigned class</label>' +
      '<select id="schedule-section" name="section_id" required>' +
      SCHEDULES.map(function (item) {
        return (
          '<option value="' +
          e(item.section_id) +
          '"' +
          (String(item.section_id) === String(selected.section_id) ? " selected" : "") +
          ">" +
          e(item.section_name) +
          "</option>"
        );
      }).join("") +
      "</select>" +
      '<label for="schedule-start">Class start time</label>' +
      '<input id="schedule-start" name="start_time" type="time" value="' +
      e(String(selected.start_time).slice(0, 5)) +
      '" required>' +
      '<label for="schedule-late">Late after</label>' +
      '<input id="schedule-late" name="late_after" type="time" value="' +
      e(String(selected.late_after).slice(0, 5)) +
      '" required>' +
      '<p class="mut">Scans after this time will be marked Late.</p>' +
      '<p id="schedule-error" class="error" role="alert"></p>' +
      '<button class="btn" type="submit">Save class schedule</button>' +
      "</form>";
  }
  function loadScheduleSettings() {
    scheduleRequest("schedule.php")
      .then(function (rows) {
        SCHEDULES = rows || [];
        renderScheduleForm();
      })
      .catch(function (error) {
        var card = $("#schedule-card");
        if (card)
          card.innerHTML =
            '<h2>Class attendance schedule</h2><p class="error show" role="alert">Could not load your class schedule: ' +
            e(error.message) +
            "</p>";
      });
  }
  function cp() {
    var t = LAST.map(function (r) {
      return r.join("\t");
    }).join("\n");
    (navigator.clipboard
      ? navigator.clipboard.writeText(t)
      : Promise.reject()
    ).then(
      function () {
        toast("Copied. Paste into Excel.");
      },
      function () {
        toast("Copy is not available in this browser.");
      },
    );
  }

  /* Views */
  function dash() {
    var act = mine().filter(function (x) {
        return x.ok;
      }),
      all = mineAtt(),
      td = all.filter(function (a) {
        return a.date === TODAY;
      });
    var c = function (s) {
      return td.filter(function (a) {
        return a.st === s;
      }).length;
    };
    var pend = act.filter(function (x) {
      return !td.some(function (a) {
        return a.sid === x.id;
      });
    });
    var fa = act.filter(function (x) {
        return x.face;
      }).length,
      fp = act.filter(function (x) {
        return x.fp;
      }).length,
      n = Math.max(act.length, 1);
    var days = [];
    all.forEach(function (a) {
      if (days.indexOf(a.date) < 0) days.push(a.date);
    });
    days = days.sort().slice(-7);
    var bars = days
      .map(function (d, i) {
        var x = all.filter(function (a) {
            return a.date === d && (a.st === "Present" || a.st === "Late");
          }).length,
          pc = Math.round((x / n) * 100),
          h = pc * 1.05,
          cx = i * 58 + 28;
        return (
          '<rect x="' +
          (cx - 18) +
          '" y="' +
          (130 - h) +
          '" width="36" height="' +
          h +
          '" rx="3" style="fill:var(--g)"/><text x="' +
          cx +
          '" y="' +
          (124 - h) +
          '" text-anchor="middle" style="fill:var(--ink);font-size:11px">' +
          pc +
          '%</text><text x="' +
          cx +
          '" y="148" text-anchor="middle" style="fill:var(--muted);font-size:11px">' +
          d.slice(5) +
          "</text>"
        );
      })
      .join("");
    var rc =
      td
        .filter(function (a) {
          return a.m !== "Manual";
        })
        .sort(function (a, b) {
          return a.time < b.time ? 1 : -1;
        })
        .slice(0, 6)
        .map(function (a) {
          return (
            '<div class="li"><span>' +
            e(sname(a.sid)) +
            '<br><span class="mut">' +
            a.time +
            " · " +
            a.m +
            "</span></span>" +
            bd(a.st) +
            "</div>"
          );
        })
        .join("") || '<p class="mut">No scans yet today.</p>';
    var pr = function (l, v) {
      return (
        '<p style="margin:0">' +
        l +
        ": " +
        v +
        " / " +
        act.length +
        '</p><div class="prog"><i style="width:' +
        Math.round((v / n) * 100) +
        '%"></i></div>'
      );
    };
    var pl =
      pend
        .slice(0, 6)
        .map(function (x) {
          return (
            '<div class="li"><span>' +
            e(x.n) +
            '</span><span class="mut">' +
            x.id +
            "</span></div>"
          );
        })
        .join("") || '<p class="mut">Everyone has a record today.</p>';
    return (
      '<div class="grid">' +
      stat("Assigned students", act.length, "ok") +
      stat("Present today", c("Present"), "ok") +
      stat("Late today", c("Late"), "warn") +
      stat("Absent / Excused", c("Absent") + c("Excused"), "bad") +
      stat("Not yet scanned", pend.length, "info") +
      "</div>" +
      '<div class="g2"><div class="card"><h2>Class attendance rate, last 7 school days</h2><svg viewBox="0 0 420 156" width="100%" role="img" aria-label="Class attendance rate by day">' +
      bars +
      "</svg></div>" +
      '<div class="card"><h2>Live attendance</h2>' +
      rc +
      '<button class="btn" data-a="scan" style="margin-top:.75rem">Simulate device scan</button></div></div>' +
      '<div class="g2"><div class="card"><h2>Biometric registration</h2>' +
      pr("Facial", fa) +
      pr("Fingerprint", fp) +
      "</div>" +
      '<div class="card"><h2>Not yet scanned today</h2>' +
      pl +
      (pend.length > 6
        ? '<p class="mut">and ' + (pend.length - 6) + " more</p>"
        : "") +
      "</div></div>"
    );
  }

  function stuTB() {
    var q = F.q.toLowerCase();
    return tbl(
      ["Student ID", "Name", "Status", "Face", "Fingerprint", "Actions"],
      mine()
        .filter(function (x) {
          return (
            (!F.st || (x.ok ? "Active" : "Inactive") === F.st) &&
            (!q || (x.n + " " + x.id).toLowerCase().indexOf(q) >= 0)
          );
        })
        .map(function (x) {
          return [
            x.id,
            e(x.n),
            bd(x.ok ? "Active" : "Inactive"),
            bd(x.face ? "Yes" : "No"),
            bd(x.fp ? "Yes" : "No"),
            btn("es", x.id, "Edit") +
              btn("bf", x.id, x.face ? "Update face" : "Register face") +
              btn(
                "bp",
                x.id,
                x.fp ? "Update fingerprint" : "Register fingerprint",
              ),
          ];
        }),
    );
  }
  function attTB() {
    var q = F.q.toLowerCase(),
      rs = mineAtt()
        .filter(function (a) {
          var n = sname(a.sid) + " " + a.sid;
          return (
            (!F.d || a.date === F.d) &&
            (!F.st || a.st === F.st) &&
            (!F.m || a.m === F.m) &&
            (!q || n.toLowerCase().indexOf(q) >= 0)
          );
        })
        .sort(function (a, b) {
          return b.date + b.time > a.date + a.time ? 1 : -1;
        });
    LAST = [
      ["Date", "Time", "Student ID", "Student", "Status", "Method"],
    ].concat(
      rs.map(function (a) {
        return [a.date, a.time, a.sid, sname(a.sid), a.st, a.m];
      }),
    );
    var out =
      '<p class="mut">' +
      rs.length +
      " record(s)" +
      (rs.length > 100 ? ", showing first 100" : "") +
      "</p>" +
      tbl(
        ["Date", "Time", "Student ID", "Student", "Status", "Method", ""],
        rs.slice(0, 100).map(function (a) {
          return [
            a.date,
            a.time,
            a.sid,
            e(sname(a.sid)),
            bd(a.st),
            a.m,
            a.st === "Absent"
              ? btn("tg", a.id, "Change to Excused")
              : a.st === "Excused"
                ? btn("tg", a.id, "Change to Absent")
                : "",
          ];
        }),
      );
    if (F.d) {
      var done = mineAtt()
        .filter(function (a) {
          return a.date === F.d;
        })
        .map(function (a) {
          return a.sid;
        });
      var pend = mine().filter(function (x) {
        return x.ok && done.indexOf(x.id) < 0;
      });
      out +=
        '<h2 style="margin:1.25rem 0 .5rem;font-size:1rem">Not yet recorded on ' +
        F.d +
        '</h2><p class="mut">Mark students who did not scan as Absent or Excused.</p>' +
        tbl(
          ["Student ID", "Name", ""],
          pend.map(function (x) {
            return [
              x.id,
              e(x.n),
              btn("mk", x.id + "|Absent", "Mark Absent") +
                btn("mk", x.id + "|Excused", "Mark Excused"),
            ];
          }),
        );
    }
    return out;
  }
  function repGen() {
    var t = F.t || "Daily",
      d = F.d || TODAY,
      a,
      b;
    if (t === "Daily") {
      a = b = d;
    } else if (t === "Weekly") {
      var x = new Date(d + "T00:00:00");
      x.setDate(x.getDate() - 6);
      a = dstr(x);
      b = d;
    } else {
      a = d.slice(0, 8) + "01";
      b = d.slice(0, 8) + "31";
    }
    var all = mineAtt();
    var rows = mine()
      .filter(function (x) {
        return !F.s || x.id === F.s;
      })
      .map(function (x) {
        var c = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
        all.forEach(function (r) {
          if (r.sid === x.id && r.date >= a && r.date <= b) c[r.st]++;
        });
        var n = c.Present + c.Late + c.Absent + c.Excused;
        return [
          x.id,
          x.n,
          c.Present,
          c.Late,
          c.Absent,
          c.Excused,
          n ? Math.round(((c.Present + c.Late) / n) * 100) + "%" : "—",
        ];
      });
    LAST = [
      [
        "Student ID",
        "Name",
        "Present",
        "Late",
        "Absent",
        "Excused",
        "Attendance rate",
      ],
    ].concat(rows);
    return (
      '<p class="mut">' +
      t +
      " report for " +
      e(CLS) +
      ", " +
      a +
      " to " +
      b +
      " · " +
      rows.length +
      " student(s)</p>" +
      tbl(
        LAST[0],
        rows.map(function (r) {
          return [r[0], e(r[1])].concat(r.slice(2));
        }),
      )
    );
  }
  var TB = { bio: bioTB, stu: stuTB, att: attTB, rep: repGen };
  var VW = {
    dash: dash,
    bio: function () {
      return (
        '<div class="bar"><select data-f="s" aria-label="Student"><option value="">Select a student</option>' +
        POOL()
          .map(function (x) {
            return (
              '<option value="' +
              x.id +
              '"' +
              (x.id === F.s ? " selected" : "") +
              ">" +
              e(x.n) +
              " (" +
              x.id +
              ")</option>"
            );
          })
          .join("") +
        '</select></div><div class="card" id="tb">' +
        bioTB() +
        "</div>"
      );
    },
    stu: function () {
      return (
        '<div class="bar">' +
        inp("q", "Search student ID or name") +
        sel("st", "All statuses", ["Active", "Inactive"], F.st) +
        '<button class="btn" data-a="as">Add student</button></div><div class="card" id="tb">' +
        stuTB() +
        "</div>"
      );
    },
    att: function () {
      return (
        '<div class="bar">' +
        inp("q", "Search student ID or name") +
        inp("d", "Date", "date", F.d) +
        sel("st", "All statuses", ST, F.st) +
        sel(
          "m",
          "All methods",
          ["Facial Recognition", "Fingerprint", "Manual"],
          F.m,
        ) +
        '<button class="btn" data-a="ma">Mark attendance manually</button><button class="sb" data-a="cp">Copy for Excel</button></div><div class="card" id="tb">' +
        attTB() +
        "</div>"
      );
    },
    schedule: function () {
      loadScheduleSettings();
      return '<div class="card" id="schedule-card"><p class="mut">Loading your assigned class schedules…</p></div>';
    },
    rep: function () {
      return (
        '<div class="bar"><select data-f="t" aria-label="Report type">' +
        ["Daily", "Weekly", "Monthly"]
          .map(function (x) {
            return (
              "<option" + (x === F.t ? " selected" : "") + ">" + x + "</option>"
            );
          })
          .join("") +
        '</select><input data-f="d" type="date" aria-label="Report date" value="' +
        F.d +
        '"><select data-f="s" aria-label="Student"><option value="">Whole class</option>' +
        mine()
          .map(function (x) {
            return (
              '<option value="' +
              x.id +
              '"' +
              (x.id === F.s ? " selected" : "") +
              ">" +
              e(x.n) +
              "</option>"
            );
          })
          .join("") +
        '</select><button class="sb" data-a="cp">Copy for Excel</button></div><div class="card" id="tb">' +
        repGen() +
        "</div>"
      );
    },
  };

  function STU(id) {
    return own(id);
  }
  function POOL() {
    return mine().filter(function (x) {
      return x.ok;
    });
  }
  /* Biometric registration */
  CL.Registered = "ok";
  CL["Not registered"] = "warn";
  var RG = $("#rg"),
    RB = $("#rb"),
    RS = null,
    RP = null;
  var POSES = [
    "Look straight at the camera",
    "Turn slightly left",
    "Turn slightly right",
    "Tilt your head up a little",
    "Tilt your head down a little",
  ];
  function stopCam() {
    if (RS) {
      RS.getTracks().forEach(function (t) {
        t.stop();
      });
      RS = null;
    }
  }
  RG.addEventListener("close", function () {
    stopCam();
    if (RP && RP.on && !RP.done)
      lg("FAILED_BIOMETRIC_REGISTRATION", RP.t + ": " + RP.x.n, "Failed");
    RP = null;
    render();
  });
  RG.addEventListener("click", function (ev) {
    if (ev.target === RG || ev.target.closest("[data-rx]")) RG.close();
  });
  function faceReg(id) {
    var x = STU(id);
    if (!x) return;
    var n = 0,
      cam = false,
      sim = false;
    RP = { x: x, t: "facial registration", on: 0, done: 0 };
    $("#rt").textContent = "Facial registration: " + x.n;
    RB.innerHTML =
      '<video id="vid" class="vid" autoplay playsinline muted></video><div class="steps" id="sp"></div><p id="rm" role="status"></p><p class="mut">Only the registration status is saved in this demo. Photos are not stored.</p><div class="dact"><button type="button" class="sb" data-rx style="padding:.5rem 1rem">Cancel</button><button type="button" class="btn" id="rgo">Start camera</button></div>';
    var go = $("#rgo"),
      m = $("#rm"),
      sp = $("#sp");
    var dots = function () {
      sp.innerHTML = POSES.map(function (p, i) {
        return '<i class="' + (i < n ? "on" : "") + '"></i>';
      }).join("");
    };
    var fail = function () {
      sim = true;
      cam = true;
      RP.on = 1;
      go.textContent = "Simulate capture";
      m.textContent =
        "The camera is not available here, so this demo simulates the capture. " +
        POSES[0];
    };
    dots();
    m.textContent =
      "Ask the student to face the camera, then start the camera.";
    go.onclick = function () {
      if (!cam) {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
          fail();
          return;
        }
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(function (s) {
            RS = s;
            $("#vid").srcObject = s;
            cam = true;
            RP.on = 1;
            go.textContent = "Capture";
            m.textContent = POSES[0];
          })
          .catch(fail);
        return;
      }
      var chk =
        sim || !("FaceDetector" in window)
          ? Promise.resolve(true)
          : new window.FaceDetector().detect($("#vid")).then(
              function (f) {
                return f.length > 0;
              },
              function () {
                return true;
              },
            );
      chk.then(function (ok) {
        if (!ok) {
          m.textContent =
            "No face detected. Move closer, face the camera, and try again.";
          return;
        }
        n++;
        dots();
        if (n < POSES.length) {
          m.textContent = POSES[n];
          return;
        }
        stopCam();
        lg(x.face ? "UPDATE_FACIAL" : "REGISTER_FACIAL", x.n);
        x.face = true;
        RP.done = 1;
        save();
        m.textContent = "Facial data registered successfully.";
        go.textContent = "Done";
        go.onclick = function () {
          RG.close();
        };
      });
    };
    RG.showModal();
  }
  function fpReg(id) {
    var x = STU(id);
    if (!x) return;
    var n = 0;
    RP = { x: x, t: "fingerprint registration", on: 0, done: 0 };
    $("#rt").textContent = "Fingerprint registration: " + x.n;
    RB.innerHTML =
      '<div class="fpad" id="fp" aria-hidden="true"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 11v4a3 3 0 0 0 .5 1.7M8 11a4 4 0 0 1 8 0v3M5 11a7 7 0 0 1 14 0v2M12 7a2 2 0 0 0-2 2v6M8 17c.3 1 .8 1.8 1.5 2.5"/></svg></div><div class="steps" id="sp"><i></i><i></i></div><p id="rm" role="status" style="text-align:center">Place the registered finger on the sensor.</p><div class="dact"><button type="button" class="sb" data-rx style="padding:.5rem 1rem">Cancel</button><button type="button" class="btn" id="rgo">Simulate sensor scan</button></div>';
    var go = $("#rgo"),
      m = $("#rm"),
      pad = $("#fp"),
      dots = document.querySelectorAll("#sp i");
    go.onclick = function () {
      if (RP.done) {
        RG.close();
        return;
      }
      RP.on = 1;
      go.disabled = true;
      pad.classList.add("on");
      m.textContent = "Reading fingerprint…";
      setTimeout(function () {
        pad.classList.remove("on");
        go.disabled = false;
        if (Math.random() < 0.15) {
          m.textContent =
            "The sensor could not read the fingerprint. Clean the finger and try again.";
          return;
        }
        dots[n++].classList.add("on");
        if (n < 2) {
          m.textContent =
            "Lift the finger, then place the same finger again to verify.";
          return;
        }
        lg(x.fp ? "UPDATE_FINGERPRINT" : "REGISTER_FINGERPRINT", x.n);
        x.fp = true;
        RP.done = 1;
        save();
        m.textContent = "Fingerprint registered successfully.";
        go.textContent = "Done";
      }, 900);
    };
    RG.showModal();
  }
  function bioTB() {
    var x = STU(F.s);
    if (!x)
      return '<p class="mut">Select a student to register or update their face and fingerprint.</p>';
    var row = function (t, ok, a, l) {
      return (
        '<div class="card"><h2>' +
        t +
        "</h2><p>" +
        bd(ok ? "Registered" : "Not registered") +
        "</p>" +
        btn(a, x.id, l) +
        "</div>"
      );
    };
    return (
      '<h2 style="margin:0">' +
      e(x.n) +
      '</h2><p class="mut">' +
      x.id +
      '</p><div class="g2">' +
      row(
        "Facial recognition",
        x.face,
        "bf",
        x.face ? "Update facial data" : "Register face",
      ) +
      row(
        "Fingerprint",
        x.fp,
        "bp",
        x.fp ? "Update fingerprint" : "Register fingerprint",
      ) +
      "</div>"
    );
  }

  /* Dialog forms */
  var DG = $("#dlg"),
    DF = $("#df"),
    CB = null;
  function openF(title, fs, cb) {
    $("#dt").textContent = title;
    CB = cb;
    DF.innerHTML =
      '<p id="fe" class="error" role="alert"></p>' +
      fs
        .map(function (f) {
          var i = "f_" + f.k;
          if (f.options) {
            return (
              '<label for="' +
              i +
              '">' +
              f.l +
              '</label><select id="' +
              i +
              '" name="' +
              f.k +
              '" style="width:100%">' +
              '<option value="">Select ' +
              e(f.l.toLowerCase()) +
              "</option>" +
              f.options
                .map(function (o) {
                  return (
                    '<option value="' +
                    e(o.v) +
                    '"' +
                    (String(o.v) === String(f.v || "") ? " selected" : "") +
                    ">" +
                    e(o.l) +
                    "</option>"
                  );
                })
                .join("") +
              "</select>"
            );
          }
          return (
            '<label for="' +
            i +
            '">' +
            e(f.l) +
            '</label><input id="' +
            i +
            '" name="' +
            f.k +
            '" type="' +
            e(f.type || "text") +
            '" value="' +
            e(f.v || "") +
            '" style="width:100%"' +
            (f.ro ? " readonly" : "") +
            (f.required ? " required" : "") +
            ">"
          );
        })
        .join("") +
      '<div class="dact"><button type="button" class="sb" data-x style="padding:.5rem 1rem">Cancel</button><button class="btn" type="submit">Save</button></div>';
    DG.showModal();
  }
  DF.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var o = {};
    new FormData(DF).forEach(function (v, k) {
      o[k] = String(v).trim();
    });
    var r = CB(o);
    if (r) {
      var f = $("#fe");
      f.textContent = r;
      f.classList.add("show");
    } else {
      save();
      DG.close();
      render();
    }
  });

  /* Actions (each one re-checks that the student belongs to this teacher's class) */
  var A = {
    cp: cp,
    scan: function () {
      var done = mineAtt()
        .filter(function (a) {
          return a.date === TODAY;
        })
        .map(function (a) {
          return a.sid;
        });
      var pool = mine().filter(function (x) {
        return x.ok && done.indexOf(x.id) < 0 && (x.face || x.fp);
      });
      if (!pool.length)
        return toast("Everyone in your class already has a record today.");
      var s = pool[(R() * pool.length) | 0],
        t = hm(),
        m = s.face ? "Facial Recognition" : "Fingerprint",
        st = t > S.set.late ? "Late" : "Present";
      S.att.push({
        id: "A-" + S.n++,
        sid: s.id,
        date: TODAY,
        time: t,
        st: st,
        m: m,
        dev: "DEV-01",
      });
      lg("ATTENDANCE_RECORDED", s.n + " via " + m);
      toast(s.n + " recorded as " + st);
      render();
    },
    as: function () {
      openF(
        "Add student to " + CLS,
        [
          { k: "n", l: "Full name" },
          { k: "c", l: "Class", v: CLS, ro: true },
        ],
        function (o) {
          if (!o.n) return "Enter the student name.";
          S.stu.push({
            id: "S-2026-" + ("00" + S.sn++).slice(-3),
            n: o.n,
            sec: CLS,
            ok: true,
            face: false,
            fp: false,
          });
          lg("STUDENT_CREATED", o.n + " (" + CLS + ")");
          toast("Student added");
        },
      );
    },
    es: function (id) {
      var x = own(id);
      if (!x) return;
      openF(
        "Edit student",
        [
          { k: "n", l: "Full name", v: x.n },
          { k: "c", l: "Class (set by the Administrator)", v: x.sec, ro: true },
        ],
        function (o) {
          if (!o.n) return "Enter the student name.";
          lg("STUDENT_UPDATED", x.n + " → " + o.n);
          x.n = o.n;
          toast("Student updated");
        },
      );
    },
    bf: faceReg,
    bp: fpReg,
    ma: function () {
      var students = POOL();
      if (!students.length)
        return toast("There are no active students in your class.");
      openF(
        "Manually mark attendance",
        [
          {
            k: "sid",
            l: "Student",
            options: students.map(function (x) {
              return { v: x.id, l: x.n + " (" + x.id + ")" };
            }),
          },
          { k: "date", l: "Date", type: "date", v: F.d || TODAY },
          {
            k: "status",
            l: "Status (Absent or Excused)",
            options: [
              { v: "Absent", l: "Absent" },
              { v: "Excused", l: "Excused" },
            ],
            v: "Absent",
          },
        ],
        function (o) {
          var x = own(o.sid);
          if (!x || !x.ok) return "Select an active student from your class.";
          if (
            !/^\d{4}-\d{2}-\d{2}$/.test(o.date) ||
            dstr(new Date(o.date + "T00:00:00")) !== o.date
          )
            return "Choose a valid date.";
          if (["Absent", "Excused"].indexOf(o.status) < 0)
            return "Choose Absent or Excused.";
          if (
            mineAtt().some(function (a) {
              return a.sid === x.id && a.date === o.date;
            })
          )
            return "This student already has a record for that date.";
          S.att.push({
            id: "A-" + S.n++,
            sid: x.id,
            date: o.date,
            time: "—",
            st: o.status,
            m: "Manual",
            dev: "—",
          });
          lg("ATTENDANCE_MARKED", x.n + " on " + o.date + ": " + o.status);
          toast(x.n + " marked " + o.status + " for " + o.date);
        },
      );
    },
    mk: function (v) {
      var p = v.split("|"),
        x = own(p[0]);
      if (!x || !F.d) return;
      if (
        mineAtt().some(function (a) {
          return a.sid === x.id && a.date === F.d;
        })
      )
        return toast("This student already has a record for that date.");
      S.att.push({
        id: "A-" + S.n++,
        sid: x.id,
        date: F.d,
        time: "—",
        st: p[1],
        m: "Manual",
        dev: "—",
      });
      lg("ATTENDANCE_MARKED", x.n + " on " + F.d + ": " + p[1]);
      render();
    },
    tg: function (id) {
      var a = S.att.filter(function (r) {
        return r.id === id;
      })[0];
      if (!a || !own(a.sid) || (a.st !== "Absent" && a.st !== "Excused"))
        return;
      var n = a.st === "Absent" ? "Excused" : "Absent";
      lg(
        "ATTENDANCE_STATUS_CHANGED",
        sname(a.sid) + " on " + a.date + ": " + a.st + " → " + n,
      );
      a.st = n;
      render();
    },
  };

  /* Wiring */
  var V = "dash",
    F = {};
  function go(v) {
    V = v;
    F = {
      q: "",
      d: v === "att" || v === "rep" ? TODAY : "",
      st: "",
      m: "",
      t: "Daily",
      s: "",
    };
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    $("#nav").innerHTML = NAV.map(function (n) {
      return (
        '<button data-v="' +
        n[0] +
        '"' +
        (n[0] === V ? ' aria-current="page"' : "") +
        ">" +
        e(n[1]) +
        "</button>"
      );
    }).join("");
    $("#ttl").textContent = NAV.filter(function (n) {
      return n[0] === V;
    })[0][1];
    $("#view").innerHTML = VW[V]();
  }
  function flt(ev) {
    var t = ev.target;
    if (t.dataset.f) {
      F[t.dataset.f] = t.value;
      var b = $("#tb");
      if (b) b.innerHTML = TB[V]();
    }
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-v],[data-a],[data-x]");
    if (!t) return;
    if (t.hasAttribute("data-x")) DG.close();
    else if (t.dataset.v) go(t.dataset.v);
    else if (A[t.dataset.a]) A[t.dataset.a](t.dataset.id);
  });
  document.addEventListener("input", flt);
  document.addEventListener("change", flt);
  document.addEventListener("change", function (ev) {
    if (ev.target.id === "schedule-section")
      renderScheduleForm(ev.target.value);
  });
  document.addEventListener("submit", function (ev) {
    if (ev.target.id !== "schedule-form") return;
    ev.preventDefault();
    var form = ev.target;
    var sectionId = form.elements.section_id.value;
    var startTime = form.elements.start_time.value;
    var lateTime = form.elements.late_after.value;
    var errorEl = $("#schedule-error");
    if (!sectionId || !startTime || !lateTime) {
      errorEl.textContent = "Choose a class and enter both schedule times.";
      errorEl.classList.add("show");
      return;
    }
    if (lateTime <= startTime) {
      errorEl.textContent = "Late after must be later than the class start time.";
      errorEl.classList.add("show");
      return;
    }
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    scheduleRequest("schedule.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_id: Number(sectionId),
        start_time: startTime + ":00",
        late_after: lateTime + ":00",
      }),
    })
      .then(function () {
        SCHEDULES.forEach(function (item) {
          if (String(item.section_id) === String(sectionId)) {
            item.start_time = startTime + ":00";
            item.late_after = lateTime + ":00";
          }
        });
        renderScheduleForm(sectionId);
        toast("Class schedule saved.");
      })
      .catch(function (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add("show");
        button.disabled = false;
      });
  });
  DG.addEventListener("click", function (ev) {
    if (ev.target === DG) DG.close();
  });
  $("#cl").textContent = CLS;
  $("#dt0").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  go("dash");
})();
