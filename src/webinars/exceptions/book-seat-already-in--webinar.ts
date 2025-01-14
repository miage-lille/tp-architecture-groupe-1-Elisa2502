export class BookSeatAlreadyInTheWebinar extends Error {
  constructor() {
    super('The user is already in the webinar');
    this.name = 'BookSeatAlreadyInTheWebinar';
  }
}
