/**
 * @jest-environment jsdom
 */

global.fetch = jest.fn(() => ({
    ok: true,
    json: async () => ({}),
}));

global.active = null;

global.USER_PERMISSIONS = { ADMIN: 0, ADULT: 1, COACH: 2, YOUTH: 3, GUEST: 4 };
global.PERM_TO_STRING = { 0: 'Admin', 1: 'Adult', 2: 'Coach', 3: 'Youth', 4: 'Guest' };


beforeAll(() => {
  global.URLSearchParams = jest.fn(() => ({
    get: () => '123',
  }));
});

const {
  fetchLoggedUser,
  fetchProfileUser,
  toggleSection,
  toggleAccInfo,
  toggleGameStats,
  toggleActions,
  setupProfileTabs,
  populateProfileInfo,
  populateAdultYouthAccounts,
  populateCoachYouthAccounts,
  USER_PERMISSIONS
} = require('../src/profile.cjs');



// ---- Setup global mocks ----
beforeEach(() => {
  jest.clearAllMocks();

  document.body.innerHTML = ''; // Reset DOM each test
});

// ---- Tests ----

describe('fetchLoggedUser', () => {
  test('fetches and returns logged user JSON', async () => {
    const mockUser = { _id: '123', username: 'John' };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockUser });

    const user = await fetchLoggedUser();
    expect(fetch).toHaveBeenCalledWith('/loggeduser');
    expect(user).toEqual(mockUser);
  });
});

// describe('fetchProfileUser', () => {
//   beforeEach(() => {
//     // Pretend URL has ?id=123
//     delete window.location;
//     window.location = new URL('https://test.com/profile.html?id=123');
//   });

//   test('returns null if no userId param', async () => {
//     window.location = new URL('https://test.com/profile.html');
//     const user = await fetchProfileUser();
//     expect(user).toBeNull();
//   });

//   test('fetches and returns user JSON when id exists', async () => {
//     const mockUser = { username: 'Jane' };
//     fetch.mockResolvedValueOnce({ json: async () => mockUser });

//     const user = await fetchProfileUser();
//     expect(fetch).toHaveBeenCalledWith('/user/123');
//     expect(user).toEqual(mockUser);
//   });
// });

describe('toggleSection', () => {
  test('shows and activates section', () => {
    document.body.innerHTML = `
      <a id="link"></a>
      <div id="section"></div>
    `;
    const link = document.getElementById('link');
    const section = document.getElementById('section');

    toggleSection(link, section, true);

    expect(section.style.display).toBe('block');
    expect(link.classList.contains('active')).toBe(true);
    expect(link.getAttribute('aria-current')).toBe('true');
  });

  test('hides and deactivates section', () => {
    document.body.innerHTML = `
      <a id="link" class="active"></a>
      <div id="section" style="display:block"></div>
    `;
    const link = document.getElementById('link');
    const section = document.getElementById('section');

    toggleSection(link, section, false);

    expect(section.style.display).toBe('none');
    expect(link.classList.contains('active')).toBe(false);
    expect(link.getAttribute('aria-current')).toBe('false');
  });
});

describe('toggleAccInfo', () => {
  test('activates account info section', () => {
    document.body.innerHTML = `
      <a id="profile-accinfo-link"></a>
      <div id="profile-accinfo"></div>
    `;
    const link = document.getElementById('profile-accinfo-link');
    const section = document.getElementById('profile-accinfo');

    toggleAccInfo(true);

    expect(link.classList.contains('active')).toBe(true);
    expect(section.style.display).toBe('block');
  });
});

describe('toggleGameStats', () => {
  test('activates stats section if youth user', async () => {
    document.body.innerHTML = `
      <a id="profile-gamestats-link"></a>
      <div id="profile-gamestats"></div>
    `;
    const mockUser = { permission: USER_PERMISSIONS.YOUTH };
    fetch.mockResolvedValueOnce({ json: async () => mockUser });

    await toggleGameStats(true);

    const link = document.getElementById('profile-gamestats-link');
    const section = document.getElementById('profile-gamestats');
    expect(link.classList.contains('active')).toBe(true);
    expect(section.style.display).toBe('block');
  });
});

describe('toggleActions', () => {
  test('shows correct section for admin', async () => {
    document.body.innerHTML = `
      <a id="profile-actions-link"></a>
      <div id="profile-actions-admin"></div>
      <div id="profile-actions-adult"></div>
      <div id="profile-actions-coach"></div>
      <div id="profile-actions-youth"></div>
    `;
    const mockUser = { permission: USER_PERMISSIONS.ADMIN };
    fetch.mockResolvedValueOnce({ json: async () => mockUser });

    await toggleActions(true);
    const adminSection = document.getElementById('profile-actions-admin');
    expect(adminSection.style.display).toBe('block');
  });
});

describe('setupProfileTabs', () => {
  test('adds event listeners to tabs and reveals gamestats for youth', async () => {
    document.body.innerHTML = `
      <a id="profile-accinfo-tab"></a>
      <a id="profile-gamestats-tab" style="display:none"></a>
      <a id="profile-actions-tab"></a>
    `;
    const loggedUser = { username: 'Coach' };
    const profileUser = { permission: USER_PERMISSIONS.YOUTH };

    fetch
      .mockResolvedValueOnce({ json: async () => loggedUser }) // logged
      .mockResolvedValueOnce({ json: async () => profileUser }); // profile

    await setupProfileTabs();

    const gameStatsTab = document.getElementById('profile-gamestats-tab');
    expect(gameStatsTab.style.display).toBe('inherit');
  });
});

describe('populateProfileInfo', () => {
  test('fills in user info correctly', async () => {
    document.body.innerHTML = `
      <span class="user_name"></span>
      <span class="user_team"></span>
      <span class="user_acctype"></span>
      <span class="user_position"></span>
    `;

    const mockUser = {
      username: 'Jane',
      team: 'Falcons',
      permission: USER_PERMISSIONS.COACH,
      position: 'Forward'
    };

    fetch.mockResolvedValueOnce({ json: async () => mockUser });

    // jQuery substitute
    global.$ = (selector) => ({
      text: (val) => {
        document.querySelectorAll(selector).forEach((el) => (el.textContent = val));
      }
    });

    await populateProfileInfo();

    expect(document.querySelector('.user_name').textContent).toBe('Jane');
    expect(document.querySelector('.user_team').textContent).toBe('Falcons');
    expect(document.querySelector('.user_acctype').textContent).toBe(
      PERM_TO_STRING[mockUser.permission]
    );
  });
});

describe('populateAdultYouthAccounts', () => {
  test('renders youth table rows for adult user', async () => {
    document.body.innerHTML = `<tbody id="adult-viewyouth-tbody"></tbody>`;

    const adultUser = { permission: USER_PERMISSIONS.ADULT };
    const youths = [{ id_user: 'y1', position: 'Midfielder', dob: '2009-03-01' }];
    const youthUser = { _id: 'y1', name: 'Timmy' };

    fetch
      .mockResolvedValueOnce({ json: async () => adultUser })
      .mockResolvedValueOnce({ json: async () => youths })
      .mockResolvedValueOnce({ json: async () => youthUser });

    await populateAdultYouthAccounts();

    const rows = document.querySelectorAll('#adult-viewyouth-tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Timmy');
  });
});

describe('populateCoachYouthAccounts', () => {
  test('renders youth rows for coach user', async () => {
    document.body.innerHTML = `<tbody id="coach-viewyouth-tbody"></tbody>`;
    const coachUser = { permission: USER_PERMISSIONS.COACH };
    const youths = [{ id_user: 'y1', id_adult: 'a1' }];
    const youthUser = { name: 'Kid' };
    const adultUser = { name: 'Parent', email: 'parent@test.com' };

    fetch
      .mockResolvedValueOnce({ json: async () => coachUser })
      .mockResolvedValueOnce({ json: async () => youths })
      .mockResolvedValueOnce({ ok: true, json: async () => youthUser })
      .mockResolvedValueOnce({ ok: true, json: async () => adultUser });

    await populateCoachYouthAccounts();

    const rows = document.querySelectorAll('#coach-viewyouth-tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Kid');
    expect(rows[0].textContent).toContain('Parent');
  });
});
