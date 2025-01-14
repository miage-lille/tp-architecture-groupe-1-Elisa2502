export class BookSeatNoPlaceAvailable extends Error {
  constructor() {
    super('No place available for this webinar');
    this.name = 'BookSeatNoPlaceAvailable';
  }
}
