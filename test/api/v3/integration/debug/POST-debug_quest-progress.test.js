import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/quest-progress', () => {
  let user;
  let nconfStub;

  beforeEach(async () => {
    user = await generateUser();
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    nconfStub.withArgs('BASE_URL').returns('https://example.com');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('errors if user is not on a quest', async () => {
    await expect(user.post('/debug/quest-progress'))
      .to.eventually.be.rejected.and.to.deep.equal({
        code: 400,
        error: 'BadRequest',
        message: 'User is not on a valid quest.',
      });
  });

  it('increases boss quest progress by 1000', async () => {
    await user.updateOne({
      'party.quest.key': 'whale',
    });

    await user.post('/debug/quest-progress');

    await user.sync();

    expect(user.party.quest.progress.up).to.eql(1000);
  });

  it('increases collection quest progress by 300 items', async () => {
    await user.updateOne({
      'party.quest.key': 'evilsanta2',
    });

    await user.post('/debug/quest-progress');

    await user.sync();

    expect(user.party.quest.progress.collectedItems).to.eql(300);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(user.post('/debug/quest-progress'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
