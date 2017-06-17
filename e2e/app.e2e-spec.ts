import { GMapAppPage } from './app.po';

describe('g-map-app App', () => {
  let page: GMapAppPage;

  beforeEach(() => {
    page = new GMapAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
