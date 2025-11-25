const dbcon = require('./DbConnect');
const dao = require('./ReviewDao');

beforeAll(async function(){ 
    await dbcon.connect('test');
});
afterAll(async function(){ 
    await dao.deleteAll();
    dbcon.disconnect();
});
beforeEach(async function(){ 
    await dao.deleteAll();
});
afterEach(function(){
    //No need
 
});

test('Create new review', async () => {
    const newReview = {
        review: 'Go Team',
        author: 'Oscar',
        authorType: 1,
        team: 'Eagles'
    };
  
    const created = await dao.create(newReview);
    const found = await dao.findById(created._id);
  
    expect(created._id).not.toBeNull();
    expect(found.review).toBe('Go Team');
    expect(found.author).toBe('Oscar');
  });

  test('Read all reviews', async () => {
    const rev1 = { message: 'Test 1', author: 'Alice', authorType: 1, team: 'Bears' };
    const rev2 = { message: 'Test 2', author: 'Bob', authorType: 2, team: 'Bears' };
    const rev3 = { message: 'Test 3', author: 'Carol', authorType: 3, team: 'Eagles' };
  
    await dao.create(rev1);
    await dao.create(rev2);
    await dao.create(rev3);
  
    const reviews = await dao.readAll();
  
    expect(reviews.length).toBe(3);
    expect(reviews[0]).toHaveProperty('review');
  });

  test('Update review', async () => {
    const rev = { rev: 'Old text', author: 'Oscar', authorType: 1 };
    const created = await dao.create(rev);
  
    const updated = await dao.update(created._id, { review: 'Updated text' });
  
    expect(updated.review).toBe('Updated text');
    expect(updated.edited).toBe(true);
    expect(updated.dateEdited).not.toBeNull();
  });

  test('Delete review', async () => {
    const rev = { review: 'Delete me', author: 'Temp', authorType: 1 };
    const created = await dao.create(rev);
  
    await dao.delete(created._id);
    const found = await dao.findById(created._id);
  
    expect(found).toBeNull();
  });
  
  test('Update non-existent rev', async () => {
    const updates = { rev: 'Updated text' };
    async  () => {
        await
            expect(dao.update('nonexistentId', updates).rejects.toThrowError)
    }
  });

  test('Check author', async () => {
    const rev = { rev: 'My review', author: 'Oscar', authorType: 1, team: 'Eagles'};
    const created = await dao.create(rev);
  
    const valid = await dao.isAuthor(created._id, 'Oscar');
    const invalid = await dao.isAuthor(created._id, 'NotOscar');
  
    expect(valid).toBe(true);
    expect(invalid).toBe(false);
  });

  test('Check review properties', async () => {
    const rev = { review: 'My review', author: 'Oscar', authorType: 1, team: 'Eagles' };
    const created = await dao.create(rev);
    const found = await dao.findById(created._id);


    expect(found).toBeTruthy();
    expect(found.review).toBe('My review');
    expect(found.author).toBe('Oscar');
    expect(found.authorType).toBe(1);
    expect(found.edited).toBeFalsy();
    expect(found.dateCreated).toBeInstanceOf(Date)
    expect(found.dateEdited).toBe(undefined);
    expect(found.team).toBe('Eagles');
  });

  