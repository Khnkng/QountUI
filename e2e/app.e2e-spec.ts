import { QountUIPage } from './app.po';

describe('qount-ui App', () => {
  let page: QountUIPage;

  beforeEach(() => {
    page = new QountUIPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
