/**
 * OCR shared shell — role-aware sidebar + user foot
 * Page needs: <div id="ocr-nav"></div> and <div id="ocr-foot" class="sidebar-foot"></div>
 * Role from ?role= or localStorage ocr_role
 */
(function () {
  var params = new URLSearchParams(location.search);
  var role = params.get('role') || localStorage.getItem('ocr_role') || 'doctor';
  if (['doctor', 'nurse', 'receptionist', 'admin'].indexOf(role) === -1) role = 'doctor';
  localStorage.setItem('ocr_role', role);

  function withRole(href) {
    if (!href || href === '#' || href.indexOf('http') === 0 || href.indexOf('mailto:') === 0) return href;
    try {
      var parts = href.split('#');
      var pathPart = parts[0];
      var hash = parts[1] ? '#' + parts[1] : '';
      var baseQs = pathPart.split('?');
      var base = baseQs[0];
      var sp = new URLSearchParams(baseQs[1] || '');
      sp.set('role', role);
      return base + '?' + sp.toString() + hash;
    } catch (e) {
      return href;
    }
  }

  var ico = {
    dash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    patients: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6"/></svg>',
    chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 12h6M9 16h4"/></svg>',
    records: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5a1 1 0 0 1 1-1h10l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="M8 11h6M8 15h4"/></svg>',
    appt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    reports: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5M4 19h16M8 15v4M12 11v8M16 8v11"/></svg>',
    reg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    audit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
    vitals: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    profile: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6"/></svg>'
  };

  var pathName = location.pathname || '';
  var page = pathName.split('/').pop() || '';
  page = page.toLowerCase();
  if (!page || page.indexOf('.html') === -1) {
    // file:// sometimes
    page = (location.href.split('/').pop() || '').split('?')[0].toLowerCase();
  }

  function item(href, icon, label) {
    var file = href.split('?')[0].split('/').pop().toLowerCase();
    var active = page === file;
    var h = withRole(href);
    return '<a class="nav-item' + (active ? ' active' : '') + '" href="' + h + '">' + icon + label + '</a>';
  }

  function group(label, html) {
    return '<div class="nav-group"><div class="nav-label">' + label + '</div>' + html + '</div>';
  }

  var navs = {
    doctor:
      group('Overview', item('ocr-dashboard.html', ico.dash, 'Dashboard')) +
      group('Patient care',
        item('ocr-patients.html', ico.patients, 'Patients') +
        item('ocr-patient-chart.html', ico.chart, 'Medical Chart') +
        item('ocr-consultation.html', ico.records, 'Medical Records') +
        item('ocr-appointments.html', ico.appt, 'Appointments')
      ) +
      group('Insights',
        item('ocr-reports.html', ico.reports, 'Reports') +
        item('ocr-profile.html', ico.profile, 'Profile')
      ),
    nurse:
      group('Overview', item('ocr-dashboard.html', ico.dash, 'Dashboard')) +
      group('Patient care',
        item('ocr-patients.html', ico.patients, 'Patients') +
        item('ocr-patient-chart.html', ico.chart, 'Medical Chart') +
        item('ocr-vitals.html', ico.vitals, 'Record vitals') +
        item('ocr-consultation.html', ico.records, 'Medical Records') +
        item('ocr-appointments.html', ico.appt, 'Appointments')
      ) +
      group('Account', item('ocr-profile.html', ico.profile, 'Profile')),
    receptionist:
      group('Overview', item('ocr-dashboard.html', ico.dash, 'Dashboard')) +
      group('Front desk',
        item('ocr-patients.html', ico.patients, 'Patients') +
        item('ocr-appointments.html', ico.appt, 'Appointments') +
        item('ocr-patient-register.html', ico.reg, 'Registration') +
        item('ocr-checkin.html', ico.check, 'Check-in / Queue')
      ) +
      group('Account', item('ocr-profile.html', ico.profile, 'Profile')),
    admin:
      group('Overview', item('ocr-dashboard.html', ico.dash, 'Dashboard')) +
      group('Administration',
        item('ocr-admin-users.html', ico.users, 'Users') +
        item('ocr-admin-roles.html', ico.shield, 'Roles & Permissions') +
        item('ocr-patients.html', ico.patients, 'Patients') +
        item('ocr-admin-audit.html', ico.audit, 'Audit Logs') +
        item('ocr-reports.html', ico.reports, 'Reports')
      ) +
      group('Account', item('ocr-profile.html', ico.profile, 'Profile'))
  };

  var users = {
    doctor: { name: 'Dr. Samuel', role: 'Clinician', av: 'DS' },
    nurse: { name: 'Hana Mekonnen', role: 'Nurse', av: 'HM' },
    receptionist: { name: 'Sara Bekele', role: 'Receptionist', av: 'SB' },
    admin: { name: 'Admin User', role: 'Administrator', av: 'AU' }
  };

  var navEl = document.getElementById('ocr-nav');
  if (navEl) {
    navEl.innerHTML = navs[role] || navs.doctor;
  }

  var u = users[role] || users.doctor;
  var foot = document.getElementById('ocr-foot');
  if (foot) {
    foot.innerHTML =
      '<div class="user-row">' +
        '<div class="avatar-sm">' + u.av + '</div>' +
        '<div class="user-meta">' +
          '<div class="foot-name">' + u.name + '</div>' +
          '<div class="foot-role">' + u.role + '</div>' +
        '</div>' +
        '<a class="signout-btn" href="ocr-login.html" title="Sign out" aria-label="Sign out">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
            '<polyline points="16 17 21 12 16 7"/>' +
            '<line x1="21" y1="12" x2="9" y2="12"/>' +
          '</svg>' +
        '</a>' +
      '</div>';
  }

  // Keep role on internal links
  var anchors = document.querySelectorAll('a[href]');
  for (var i = 0; i < anchors.length; i++) {
    var a = anchors[i];
    var h = a.getAttribute('href');
    if (h && h.indexOf('.html') !== -1 && h.indexOf('http') !== 0) {
      a.setAttribute('href', withRole(h));
    }
  }

  if (typeof window !== "undefined") window.OCR = { role: role, withRole: withRole, user: u };
})();
