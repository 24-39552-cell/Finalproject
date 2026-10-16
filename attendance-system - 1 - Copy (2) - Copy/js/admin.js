(function () {
  'use strict';

  /* ---- DOM & String Helpers ---- */
  var $ = function (s) { return document.querySelector(s); };
  var e = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var p2 = function (n) { return ('0' + n).slice(-2); };
  var dstr = function (d) {
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  };
  var TODAY = dstr(new Date());

  /* ---- Auth Guard & Session ---- */
  var ME = null;
  try {
    ME = JSON.parse(sessionStorage.getItem('att_user'));
  } catch (err) {}

  if (!ME || ME.role !== 'Administrator') {
    window.location.href = 'login.html';
    return;
  }

  // Update header display
  var whoNameEl = $('#who_name');
  if (whoNameEl) {
    whoNameEl.textContent = (ME.full_name || 'Admin') + ', Administrator';
  }
  var dt0El = $('#dt0');
  if (dt0El) {
    dt0El.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Logout link handler
  var outLink = $('.out');
  if (outLink) {
    outLink.addEventListener('click', function (ev) {
      ev.preventDefault();
      fetch('api/auth.php?action=logout', {
        method: 'POST',
        headers: { 'X-Session-Token': ME ? ME.token : '' }
      }).finally(function () {
        sessionStorage.clear();
        window.location.href = 'login.html';
      });
    });
  }

  /* ---- API Client ---- */
  function api(path, opts) {
    opts = opts || {};
    opts.credentials = 'include';
    if (!opts.headers) opts.headers = {};
    if (ME && ME.token) opts.headers['X-Session-Token'] = ME.token;
    return fetch('api/' + path, opts).then(function (res) {
      if (res.status === 401) {
        sessionStorage.clear();
        window.location.href = 'login.html';
        throw new Error('Unauthorized');
      }
      return res;
    });
  }

  function apiJSON(path, opts) {
    return api(path, opts).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error(data.error || 'Server error (' + res.status + ')');
        }
        return data;
      });
    });
  }

  function apiPost(path, body) {
    return apiJSON(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function apiPut(path, body) {
    return apiJSON(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function apiPatch(path, body) {
    return apiJSON(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function apiDelete(path) {
    return apiJSON(path, { method: 'DELETE' });
  }

  /* ---- UI Constants & Badges ---- */
  var NAV = [
    ['dash', 'Dashboard'],
    ['stu', 'Students'],
    ['tea', 'Teachers'],
    ['cls', 'Classes & Settings'],
    ['rep', 'Reports'],
    ['log', 'Activity Logs']
  ];
  var CL = {
    Present: 'ok',
    Late: 'warn',
    Absent: 'bad',
    Excused: 'info',
    Online: 'ok',
    Offline: 'bad',
    Error: 'bad',
    Maintenance: 'warn',
    Active: 'ok',
    Inactive: 'bad',
    Yes: 'ok',
    No: 'warn',
    Success: 'ok',
    Failed: 'bad'
  };

  var bd = function (t) {
    var c = CL[t] || 'line';
    return '<span class="b" style="--c:var(--' + c + ')">' + e(t) + '</span>';
  };

  var btn = function (a, id, t) {
    return '<button class="sb" data-a="' + a + '" data-id="' + id + '">' + t + '</button>';
  };

  function tbl(headers, rows) {
    return (
      '<div class="tw"><table><thead><tr>' +
      headers.map(function (x) { return '<th>' + x + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      (rows.length
        ? rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
          }).join('')
        : '<tr><td colspan="' + headers.length + '" class="mut">No records found.</td></tr>') +
      '</tbody></table></div>'
    );
  }

  function sel(k, label, options, val) {
    return (
      '<select data-f="' + k + '" aria-label="' + label + '">' +
      '<option value="">' + label + '</option>' +
      options.map(function (x) {
        var optVal = typeof x === 'object' ? x.id : x;
        var optTxt = typeof x === 'object' ? x.name : x;
        var isSel = String(optVal) === String(val) ? ' selected' : '';
        return '<option value="' + e(optVal) + '"' + isSel + '>' + e(optTxt) + '</option>';
      }).join('') +
      '</select>'
    );
  }

  function inp(k, ph, type, val) {
    return (
      '<input data-f="' + k + '" type="' + (type || 'search') + '" placeholder="' + ph +
      '" aria-label="' + ph + '" value="' + e(val || '') + '">'
    );
  }

  function stat(l, v, c) {
    return (
      '<div class="card stat" style="--c:var(--' + c + ')"><b>' + v +
      '</b><span>' + l + '</span></div>'
    );
  }

  var LAST_TABLE = [];
  function toast(msg, ms) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () {
      t.classList.remove('show');
    }, ms || 3000);
  }

  function copyLastTable() {
    if (!LAST_TABLE.length) {
      toast('No data to copy.');
      return;
    }
    var t = LAST_TABLE.map(function (r) { return r.join('\t'); }).join('\n');
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject())
      .then(function () {
        toast('Copied table data. Paste directly into Excel.');
      })
      .catch(function () {
        toast('Clipboard copy unavailable.');
      });
  }

  /* ---- Application State ---- */
  var V = 'dash';
  var F = {};
  var SECTIONS = [];

  function loadSections() {
    return apiJSON('sections.php').then(function (secs) {
      SECTIONS = secs || [];
      return SECTIONS;
    }).catch(function () {
      SECTIONS = [];
      return [];
    });
  }

  /* ---- Views ---- */

  /* 1. Dashboard View */
  function renderDash() {
    var viewEl = $('#view');
    viewEl.innerHTML = '<div class="card"><p class="mut">Loading dashboard statistics…</p></div>';

    apiJSON('dashboard.php').then(function (d) {
      var act = d.total_students || 0;
      var pres = d.present_today || 0;
      var late = d.late_today || 0;
      var abs = d.absent_today || 0;
      var exc = d.excused_today || 0;
      var pend = d.not_scanned_today || 0;

      // Roll call tiles
      var roll = d.roll || [];
      var tiles = roll.length
        ? roll.map(function (st) {
            var s = st.status;
            var c = s ? CL[s] : 'line';
            var title = e(st.full_name) + ': ' + (s || 'Not yet scanned');
            return '<i class="t" title="' + title + '" style="--c:var(--' + c + ')"></i>';
          }).join('')
        : '<p class="mut" style="padding:.5rem 0">No students registered yet. Add students to see today\'s roll call.</p>';

      var keyLegend = [
        ['Present', 'ok'],
        ['Late', 'warn'],
        ['Absent', 'bad'],
        ['Excused', 'info'],
        ['Not yet scanned', 'line']
      ].map(function (k) {
        return '<span style="--c:var(--' + k[1] + ')">' + k[0] + '</span>';
      }).join('');

      // 7-day attendance chart
      var chart = d.attendance_chart || [];
      var bars = chart.map(function (day, i) {
        var attended = (day.present || 0) + (day.late || 0);
        var total = day.total || act || 1;
        var pc = total > 0 ? Math.round((attended / total) * 100) : 0;
        var h = Math.round(pc * 1.05);
        var cx = i * 58 + 28;
        return (
          '<rect x="' + (cx - 18) + '" y="' + (130 - h) + '" width="36" height="' + h +
          '" rx="3" style="fill:var(--g)"/><text x="' + cx + '" y="' + (124 - h) +
          '" text-anchor="middle" style="fill:var(--ink);font-size:11px">' + pc +
          '%</text><text x="' + cx + '" y="' + 148 +
          '" text-anchor="middle" style="fill:var(--muted);font-size:11px">' +
          day.date.slice(5) + '</text>'
        );
      }).join('');

      // Live attendance list
      var rec = d.recent_attendance || [];
      var rc = rec.length
        ? rec.slice(0, 6).map(function (a) {
            return (
              '<div class="li"><span>' + e(a.student_name) + '<br><span class="mut">' +
              (a.time_in ? a.time_in.slice(0, 5) : '—') + ' · ' + e(a.method) + ' · ' +
              e(a.device_code || 'IoT') + '</span></span>' + bd(a.status) + '</div>'
            );
          }).join('')
        : '<p class="mut">No scans yet today.</p>';

      // Recent activity
      var logs = d.recent_logs || [];
      var logList = logs.length
        ? logs.slice(0, 5).map(function (l) {
            return (
              '<div class="li"><span>' + e(l.action) + '<br><span class="mut">' +
              e(l.details) + '</span></span><span class="mut">' +
              (l.created_at ? l.created_at.slice(11, 16) : '') + '</span></div>'
            );
          }).join('')
        : '<p class="mut">No recent activity.</p>';

      // Devices summary
      var devs = d.devices || [];
      var devHtml = devs.length
        ? devs.map(function (dv) {
            return (
              '<div class="li"><span>' + e(dv.name) + ' (' + e(dv.device_code) + ')<br><span class="mut">' +
              e(dv.location || 'Campus') + ' · Last seen: ' + (dv.last_seen || 'Never') + '</span></span>' +
              bd(dv.status) + '</div>'
            );
          }).join('')
        : '<p class="mut">No IoT devices registered. Go to Classes & Settings to register ESP32 devices.</p>';

      viewEl.innerHTML =
        '<div class="grid">' +
        stat('Active students', act, 'ok') +
        stat('Present today', pres, 'ok') +
        stat('Late today', late, 'warn') +
        stat('Absent / Excused', abs + exc, 'bad') +
        stat('Not yet scanned', pend, 'info') +
        '</div>' +
        '<div class="card"><h2>Today\'s roll call</h2><div class="roll">' + tiles + '</div>' +
        '<p class="key">' + keyLegend + '</p></div>' +
        '<div class="g2">' +
        '<div class="card"><h2>Attendance rate, last 7 school days</h2>' +
        '<svg viewBox="0 0 420 156" width="100%" role="img" aria-label="Attendance rate by day">' +
        (bars || '<text x="210" y="80" text-anchor="middle" fill="#888">No attendance history available yet</text>') +
        '</svg></div>' +
        '<div class="card"><h2>Live attendance scans</h2>' + rc +
        '<p class="mut" style="margin-top:.75rem;font-size:12px;">Connected to ESP32 biometric sensors via API.</p>' +
        '</div>' +
        '</div>' +
        '<div class="card"><h2>Recent activity</h2>' + logList + '</div>' +
        '<div class="card"><h2>IoT Attendance Devices</h2>' + devHtml + '</div>';
    }).catch(function (err) {
      viewEl.innerHTML = '<div class="card error show"><p>Failed to load dashboard: ' + e(err.message) + '</p></div>';
    });
  }

  /* 3. Students View */
  function renderStu() {
    var viewEl = $('#view');
    var secOpts = SECTIONS.map(function (s) { return { id: s.id, name: s.name }; });

    viewEl.innerHTML =
      '<div class="bar">' +
      inp('q', 'Search student ID or name', 'search', F.q) +
      sel('sec', 'All sections', secOpts, F.sec) +
      sel('st', 'All statuses', ['Active', 'Inactive'], F.st) +
      '<button class="btn" data-a="as">Add student</button>' +
      '</div>' +
      '<div class="card" id="tb"><p class="mut">Loading students…</p></div>';

    fetchStudentsTable();
  }

  function fetchStudentsTable() {
    var tbEl = $('#tb');
    if (!tbEl) return;

    var params = [];
    if (F.q) params.push('q=' + encodeURIComponent(F.q));
    if (F.sec) params.push('section_id=' + encodeURIComponent(F.sec));
    if (F.st) params.push('status=' + encodeURIComponent(F.st));

    apiJSON('students.php?' + params.join('&')).then(function (rows) {
      rows = rows || [];
      tbEl.innerHTML =
        '<p class="mut">' + rows.length + ' student(s) registered.</p>' +
        tbl(
          ['Student ID', 'Name', 'Section', 'Status', 'Face', 'Fingerprint', 'Actions'],
          rows.map(function (x) {
            return [
              e(x.student_id),
              e(x.full_name),
              e(x.section_name || 'Unassigned'),
              bd(x.is_active ? 'Active' : 'Inactive'),
              bd(x.face_registered ? 'Yes' : 'No'),
              bd(x.fingerprint_registered ? 'Yes' : 'No'),
              btn('es', x.id, 'Edit') +
              btn('ts', x.id, x.is_active ? 'Deactivate' : 'Activate')
            ];
          })
        );
    }).catch(function (err) {
      tbEl.innerHTML = '<p class="error show">Failed to load students: ' + e(err.message) + '</p>';
    });
  }

  /* 5. Teachers View */
  function renderTea() {
    var viewEl = $('#view');
    viewEl.innerHTML =
      '<div class="bar">' +
      inp('q', 'Search name or email', 'search', F.q) +
      sel('st', 'All statuses', ['Active', 'Inactive'], F.st) +
      '<button class="btn" data-a="at">Add teacher</button>' +
      '</div>' +
      '<div class="card" id="tb"><p class="mut">Loading teachers…</p></div>';

    fetchTeachersTable();
  }

  function fetchTeachersTable() {
    var tbEl = $('#tb');
    if (!tbEl) return;

    var params = ['role=Teacher'];
    if (F.q) params.push('q=' + encodeURIComponent(F.q));

    apiJSON('users.php?' + params.join('&')).then(function (rows) {
      rows = rows || [];
      if (F.st) {
        rows = rows.filter(function (x) {
          return (x.is_active ? 'Active' : 'Inactive') === F.st;
        });
      }

      tbEl.innerHTML =
        '<p class="mut">' + rows.length + ' teacher account(s) registered.</p>' +
        tbl(
          ['Teacher ID', 'Name', 'Username', 'Email', 'Assigned Class', 'Status', 'Actions'],
          rows.map(function (x) {
            return [
              'T-' + p2(x.id),
              e(x.full_name),
              e(x.username),
              e(x.email),
              e(x.sections || 'Unassigned'),
              bd(x.is_active ? 'Active' : 'Inactive'),
              btn('et', x.id, 'Edit') +
              btn('rp', x.id, 'Reset password') +
              btn('tt', x.id, x.is_active ? 'Deactivate' : 'Activate')
            ];
          })
        );
    }).catch(function (err) {
      tbEl.innerHTML = '<p class="error show">Failed to load teachers: ' + e(err.message) + '</p>';
    });
  }

  /* 6. Classes & Settings View */
  function renderCls() {
    var viewEl = $('#view');
    viewEl.innerHTML = '<div class="card"><p class="mut">Loading classes and devices…</p></div>';

    Promise.all([
      apiJSON('sections.php'),
      apiJSON('devices.php')
    ]).then(function (results) {
      var secs = results[0] || [];
      var devs = results[1] || [];
      SECTIONS = secs;

      var devTable = tbl(
        ['Device Code', 'Name', 'Location', 'Status', 'Last Heartbeat', 'Actions'],
        devs.map(function (d) {
          return [
            e(d.device_code),
            e(d.name),
            e(d.location || '—'),
            bd(d.status),
            e(d.last_seen || 'Never'),
            btn('edev', d.id, 'Edit') + btn('ddev', d.id, 'Remove')
          ];
        })
      );

      viewEl.innerHTML =
        '<div class="g2">' +
        '<div class="card"><h2>Classes and sections</h2>' +
        tbl(
          ['Section', 'Grade / SY', 'Active students', 'Assigned Teacher', 'Actions'],
          secs.map(function (s) {
            return [
              e(s.name),
              e((s.grade_level || '') + (s.school_year ? ' (' + s.school_year + ')' : '')),
              s.active_students || 0,
              e(s.teachers || 'Unassigned'),
              btn('esec', s.id, 'Edit') + btn('dsec', s.id, 'Delete')
            ];
          })
        ) +
        '<button class="btn" data-a="asec" style="margin-top:.75rem">Add section</button>' +
        '</div>' +
        '</div>' +
        '<div class="card" style="margin-top:1.5rem"><h2>IoT Attendance Monitoring Devices (ESP32)</h2>' +
        '<p class="mut">Manage edge devices running OV2640 cameras and R307 optical fingerprint modules.</p>' +
        devTable +
        '<button class="btn" data-a="adev" style="margin-top:.75rem">Register IoT Device</button>' +
        '</div>';
    }).catch(function (err) {
      viewEl.innerHTML = '<div class="card error show"><p>Failed to load classes and settings: ' + e(err.message) + '</p></div>';
    });
  }

  /* 7. Reports View */
  function renderRep() {
    var viewEl = $('#view');
    var secOpts = SECTIONS.map(function (s) { return { id: s.id, name: s.name }; });
    var reportTypes = ['Daily', 'Weekly', 'Monthly'];

    viewEl.innerHTML =
      '<div class="bar">' +
      '<select data-f="t" aria-label="Report type">' +
      reportTypes.map(function (x) {
        return '<option' + (x === (F.t || 'Daily') ? ' selected' : '') + '>' + x + '</option>';
      }).join('') +
      '</select>' +
      inp('d', 'Report date', 'date', F.d || TODAY) +
      sel('sec', 'All classes', secOpts, F.sec) +
      '<button class="sb" data-a="cp">Copy for Excel</button>' +
      '<button class="btn" data-a="dl_excel">Export to Excel (.CSV)</button>' +
      '</div>' +
      '<div class="card" id="tb"><p class="mut">Loading report data…</p></div>';

    fetchReportData();
  }

  function fetchReportData() {
    var tbEl = $('#tb');
    if (!tbEl) return;

    var repType = F.t || 'Daily';
    var repDate = F.d || TODAY;
    var params = ['type=' + encodeURIComponent(repType), 'date=' + encodeURIComponent(repDate)];
    if (F.sec) params.push('section_id=' + encodeURIComponent(F.sec));

    apiJSON('reports.php?' + params.join('&')).then(function (res) {
      var rows = (res && res.rows) || [];
      var range = res ? res.date_from + ' to ' + res.date_to : repDate;

      LAST_TABLE = [
        ['Student ID', 'Name', 'Section', 'Present', 'Late', 'Absent', 'Excused', 'Attendance Rate']
      ].concat(rows.map(function (r) {
        return [
          r.student_id,
          r.full_name,
          r.section_name || '—',
          r.present,
          r.late,
          r.absent,
          r.excused,
          r.rate
        ];
      }));

      tbEl.innerHTML =
        '<p class="mut">' + repType + ' report (' + range + ') · ' + rows.length + ' student(s) included.</p>' +
        tbl(
          ['Student ID', 'Name', 'Section', 'Present', 'Late', 'Absent', 'Excused', 'Attendance Rate'],
          rows.map(function (r) {
            return [
              e(r.student_id),
              e(r.full_name),
              e(r.section_name || 'Unassigned'),
              r.present,
              r.late,
              r.absent,
              r.excused,
              bd(r.rate)
            ];
          })
        );
    }).catch(function (err) {
      tbEl.innerHTML = '<p class="error show">Failed to generate report: ' + e(err.message) + '</p>';
    });
  }

  /* 8. Activity Logs View */
  function renderLog() {
    var viewEl = $('#view');
    viewEl.innerHTML =
      '<div class="bar">' +
      inp('q', 'Search action, user, or details', 'search', F.q) +
      '</div>' +
      '<div class="card" id="tb"><p class="mut">Loading activity logs…</p></div>';

    fetchLogsTable();
  }

  function fetchLogsTable() {
    var tbEl = $('#tb');
    if (!tbEl) return;

    var params = [];
    if (F.q) params.push('q=' + encodeURIComponent(F.q));

    apiJSON('logs.php?' + params.join('&')).then(function (data) {
      var rows = (data && data.rows) || [];
      tbEl.innerHTML =
        '<p class="mut">' + (data.total || rows.length) +
        ' entries. Audit logs are append-only and protected against modification.</p>' +
        tbl(
          ['Date and time', 'User / Actor', 'Action', 'Details', 'Result', 'IP Address'],
          rows.map(function (l) {
            return [
              e(l.created_at),
              e(l.user_label),
              '<code>' + e(l.action) + '</code>',
              e(l.details),
              bd(l.result),
              e(l.ip_address || '—')
            ];
          })
        );
    }).catch(function (err) {
      tbEl.innerHTML = '<p class="error show">Failed to load logs: ' + e(err.message) + '</p>';
    });
  }

  /* ---- View Router ---- */
  var VIEW_RENDERERS = {
    dash: renderDash,
    stu: renderStu,
    tea: renderTea,
    cls: renderCls,
    rep: renderRep,
    log: renderLog
  };

  function go(viewName) {
    V = viewName;
    F = {
      q: '',
      d: viewName === 'rep' ? TODAY : '',
      sec: '',
      st: '',
      m: '',
      t: 'Daily',
      s: ''
    };
    renderNavigation();
    window.scrollTo(0, 0);
  }

  function renderNavigation() {
    $('#nav').innerHTML = NAV.map(function (n) {
      return (
        '<button data-v="' + n[0] + '"' +
        (n[0] === V ? ' aria-current="page"' : '') + '>' +
        e(n[1]) + '</button>'
      );
    }).join('');

    var navItem = NAV.filter(function (n) { return n[0] === V; })[0];
    $('#ttl').textContent = navItem ? navItem[1] : 'Portal';

    if (VIEW_RENDERERS[V]) {
      VIEW_RENDERERS[V]();
    }
  }

  /* ---- Form Dialog Helper ---- */
  var DG = $('#dlg');
  var DF = $('#df');
  var dialogCallback = null;

  function openForm(title, fields, onSubmit) {
    $('#dt').textContent = title;
    dialogCallback = onSubmit;

    DF.innerHTML =
      '<p id="fe" class="error" role="alert"></p>' +
      fields.map(function (f) {
        var id = 'f_' + f.k;
        var inputHtml = '';
        if (f.o) {
          inputHtml =
            '<select id="' + id + '" name="' + f.k + '">' +
            f.o.map(function (opt) {
              var val = typeof opt === 'object' ? opt.id : opt;
              var txt = typeof opt === 'object' ? opt.name : opt;
              var isSel = String(val) === String(f.v) ? ' selected' : '';
              return '<option value="' + e(val) + '"' + isSel + '>' + e(txt) + '</option>';
            }).join('') +
            '</select>';
        } else {
          inputHtml =
            '<input id="' + id + '" name="' + f.k + '" type="' + (f.t || 'text') +
            '" value="' + e(f.v || '') + '"' + (f.req ? ' required' : '') +
            ' style="width:100%">';
        }
        return '<label for="' + id + '">' + f.l + '</label>' + inputHtml;
      }).join('') +
      '<div class="dact">' +
      '<button type="button" class="sb" data-x style="padding:.5rem 1rem">Cancel</button>' +
      '<button class="btn" type="submit">Save</button>' +
      '</div>';

    DG.showModal();
  }

  DF.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var formData = {};
    new FormData(DF).forEach(function (v, k) {
      formData[k] = String(v).trim();
    });

    var errorEl = $('#fe');
    errorEl.classList.remove('show');
    errorEl.textContent = '';

    if (dialogCallback) {
      var result = dialogCallback(formData);
      if (result && typeof result.then === 'function') {
        result.then(function () {
          DG.close();
          renderNavigation();
        }).catch(function (err) {
          errorEl.textContent = err.message || 'Operation failed.';
          errorEl.classList.add('show');
        });
      } else if (result) {
        errorEl.textContent = result;
        errorEl.classList.add('show');
      } else {
        DG.close();
        renderNavigation();
      }
    }
  });

  /* ---- Action Handlers ---- */
  var ACTIONS = {
    cp: copyLastTable,

    dl_excel: function () {
      var repType = F.t || 'Daily';
      var repDate = F.d || TODAY;
      var url = 'api/reports.php?export=excel&type=' + encodeURIComponent(repType) +
        '&date=' + encodeURIComponent(repDate);
      if (F.sec) url += '&section_id=' + encodeURIComponent(F.sec);

      window.location.href = url;
      toast('Exporting Excel report…');
    },

    as: function () {
      loadSections().then(function (secs) {
        var secOpts = [{ id: '', name: '— Unassigned —' }].concat(
          secs.map(function (s) { return { id: s.id, name: s.name }; })
        );
        openForm(
          'Add New Student',
          [
            { k: 'student_id', l: 'Student ID (e.g. S-2026-001)', req: true },
            { k: 'full_name', l: 'Full Name', req: true },
            { k: 'section_id', l: 'Section / Class', o: secOpts },
            { k: 'school_year', l: 'School Year', v: '2026-2027' }
          ],
          function (formData) {
            return apiPost('students.php', {
              student_id: formData.student_id,
              full_name: formData.full_name,
              section_id: formData.section_id ? parseInt(formData.section_id, 10) : null,
              school_year: formData.school_year
            }).then(function () {
              toast('Student registered successfully.');
            });
          }
        );
      });
    },

    es: function (studentId) {
      Promise.all([
        apiJSON('students.php?id=' + studentId),
        loadSections()
      ]).then(function (results) {
        var stu = results[0];
        var secs = results[1];
        var secOpts = [{ id: '', name: '— Unassigned —' }].concat(
          secs.map(function (s) { return { id: s.id, name: s.name }; })
        );
        openForm(
          'Edit Student: ' + stu.full_name,
          [
            { k: 'student_id', l: 'Student ID', v: stu.student_id, req: true },
            { k: 'full_name', l: 'Full Name', v: stu.full_name, req: true },
            { k: 'section_id', l: 'Section / Class', o: secOpts, v: stu.section_id || '' },
            { k: 'school_year', l: 'School Year', v: stu.school_year || '' }
          ],
          function (formData) {
            return apiPut('students.php?id=' + studentId, {
              student_id: formData.student_id,
              full_name: formData.full_name,
              section_id: formData.section_id ? parseInt(formData.section_id, 10) : null,
              school_year: formData.school_year
            }).then(function () {
              toast('Student updated.');
            });
          }
        );
      });
    },

    ts: function (studentId) {
      apiPatch('students.php?id=' + studentId + '&action=toggle_status', {})
        .then(function (res) {
          toast(res.is_active ? 'Student activated.' : 'Student deactivated.');
          renderNavigation();
        })
        .catch(function (err) {
          toast(err.message);
        });
    },

    at: function () {
      loadSections().then(function (secs) {
        var secOpts = [{ id: '', name: '— None / Floating —' }].concat(
          secs.map(function (s) { return { id: s.id, name: s.name }; })
        );
        openForm(
          'Create Teacher Account',
          [
            { k: 'full_name', l: 'Full Name', req: true },
            { k: 'username', l: 'Username', req: true },
            { k: 'email', l: 'Email Address', t: 'email', req: true },
            { k: 'password', l: 'Password', t: 'password', req: true },
            { k: 'section_id', l: 'Assigned Class / Section', o: secOpts }
          ],
          function (formData) {
            return apiPost('users.php', {
              full_name: formData.full_name,
              username: formData.username,
              email: formData.email,
              password: formData.password,
              role: 'Teacher',
              section_id: formData.section_id ? parseInt(formData.section_id, 10) : null
            }).then(function () {
              toast('Teacher account created successfully.');
            });
          }
        );
      });
    },

    et: function (userId) {
      Promise.all([
        apiJSON('users.php?id=' + userId),
        loadSections()
      ]).then(function (results) {
        var user = results[0];
        var secs = results[1];
        var secOpts = [{ id: '', name: '— None / Floating —' }].concat(
          secs.map(function (s) { return { id: s.id, name: s.name }; })
        );
        openForm(
          'Edit Teacher: ' + user.full_name,
          [
            { k: 'full_name', l: 'Full Name', v: user.full_name, req: true },
            { k: 'email', l: 'Email Address', t: 'email', v: user.email, req: true },
            { k: 'section_id', l: 'Assigned Class / Section', o: secOpts, v: user.section_id || '' }
          ],
          function (formData) {
            return apiPut('users.php?id=' + userId, {
              full_name: formData.full_name,
              email: formData.email,
              section_id: formData.section_id ? parseInt(formData.section_id, 10) : null
            }).then(function () {
              toast('Teacher updated.');
            });
          }
        );
      });
    },

    tt: function (userId) {
      apiPatch('users.php?id=' + userId + '&action=toggle_status', {})
        .then(function (res) {
          toast(res.is_active ? 'Teacher account activated.' : 'Teacher account deactivated.');
          renderNavigation();
        })
        .catch(function (err) {
          toast(err.message);
        });
    },

    rp: function (userId) {
      openForm(
        'Reset Teacher Password',
        [
          { k: 'password', l: 'New Password (min 6 chars)', t: 'password', req: true }
        ],
        function (formData) {
          if (!formData.password || formData.password.length < 6) {
            return 'Password must be at least 6 characters.';
          }
          return apiPatch('users.php?id=' + userId + '&action=reset_password', {
            password: formData.password
          }).then(function () {
            toast('Password reset successfully.');
          });
        }
      );
    },

    asec: function () {
      openForm(
        'Add New Section / Class',
        [
          { k: 'name', l: 'Section Name (e.g. Grade 10 – Rizal)', req: true },
          { k: 'grade_level', l: 'Grade Level (e.g. Grade 10)' },
          { k: 'school_year', l: 'School Year', v: '2026-2027' }
        ],
        function (formData) {
          return apiPost('sections.php', {
            name: formData.name,
            grade_level: formData.grade_level,
            school_year: formData.school_year
          }).then(function () {
            toast('Section added successfully.');
          });
        }
      );
    },

    esec: function (sectionId) {
      var s = SECTIONS.filter(function (x) { return String(x.id) === String(sectionId); })[0];
      if (!s) return;
      openForm(
        'Edit Section: ' + s.name,
        [
          { k: 'name', l: 'Section Name', v: s.name, req: true },
          { k: 'grade_level', l: 'Grade Level', v: s.grade_level || '' },
          { k: 'school_year', l: 'School Year', v: s.school_year || '' }
        ],
        function (formData) {
          return apiPut('sections.php?id=' + sectionId, {
            name: formData.name,
            grade_level: formData.grade_level,
            school_year: formData.school_year
          }).then(function () {
            toast('Section updated.');
          });
        }
      );
    },

    dsec: function (sectionId) {
      if (!confirm('Are you sure you want to delete this section? Students in this section will become unassigned.')) return;
      apiDelete('sections.php?id=' + sectionId).then(function () {
        toast('Section deleted.');
        renderNavigation();
      }).catch(function (err) {
        toast(err.message);
      });
    },

    adev: function () {
      openForm(
        'Register IoT Attendance Device (ESP32)',
        [
          { k: 'device_code', l: 'Device Code (e.g. DEV-01)', req: true },
          { k: 'name', l: 'Device Name / Description', req: true },
          { k: 'location', l: 'Installation Location (e.g. Main Gate, Building A)' }
        ],
        function (formData) {
          return apiPost('devices.php', {
            device_code: formData.device_code,
            name: formData.name,
            location: formData.location
          }).then(function (res) {
            toast('Device registered! Secret Key: ' + res.device_key, 8000);
          });
        }
      );
    },

    edev: function (deviceId) {
      apiJSON('devices.php').then(function (devs) {
        var d = devs.filter(function (x) { return String(x.id) === String(deviceId); })[0];
        if (!d) return;
        openForm(
          'Edit Device: ' + d.name,
          [
            { k: 'name', l: 'Device Name', v: d.name, req: true },
            { k: 'location', l: 'Location', v: d.location || '' },
            { k: 'status', l: 'Operational Status', o: ['Online', 'Offline', 'Maintenance', 'Error'], v: d.status }
          ],
          function (formData) {
            return apiPut('devices.php?id=' + deviceId, {
              name: formData.name,
              location: formData.location,
              status: formData.status
            }).then(function () {
              toast('Device updated.');
            });
          }
        );
      });
    },

    ddev: function (deviceId) {
      if (!confirm('Remove this IoT device from the system?')) return;
      apiDelete('devices.php?id=' + deviceId).then(function () {
        toast('Device removed.');
        renderNavigation();
      }).catch(function (err) {
        toast(err.message);
      });
    }
  };

  /* ---- Event Delegation ---- */
  function onFilterInput(ev) {
    var target = ev.target;
    if (target && target.dataset && target.dataset.f) {
      F[target.dataset.f] = target.value;
      if (V === 'stu') fetchStudentsTable();
      else if (V === 'tea') fetchTeachersTable();
      else if (V === 'log') fetchLogsTable();
      else if (V === 'rep') fetchReportData();
    }
  }

  document.addEventListener('input', onFilterInput);
  document.addEventListener('change', onFilterInput);

  document.addEventListener('click', function (ev) {
    var target = ev.target.closest('[data-v],[data-a],[data-x]');
    if (!target) return;

    if (target.hasAttribute('data-x')) {
      DG.close();
    } else if (target.dataset.v) {
      go(target.dataset.v);
    } else if (ACTIONS[target.dataset.a]) {
      ACTIONS[target.dataset.a](target.dataset.id);
    }
  });

  DG.addEventListener('click', function (ev) {
    if (ev.target === DG) DG.close();
  });

  /* ---- Initial Load ---- */
  loadSections().finally(function () {
    go('dash');
  });

})();
