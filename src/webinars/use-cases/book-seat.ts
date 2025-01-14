import { IMailer, Email } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { BookSeatNoPlaceAvailable } from '../exceptions/book-seat-no-place_available';
import { BookSeatAlreadyInTheWebinar } from '../exceptions/book-seat-already-in--webinar';
import { Participation } from '../entities/participation.entity';

type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}
  async execute({ webinarId, user }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);
    const participationList =
      await this.participationRepository.findByWebinarId(webinarId);

    if (webinar != null) {
      if (participationList.length === webinar.props.seats) {
        //Plus de places
        throw new BookSeatNoPlaceAvailable();
      }

      participationList.forEach(
        (participation: { props: { userId: string } }) => {
          if (participation.props.userId === user.props.id) {
            //Le participant est déjà dans ce webinaire
            throw new BookSeatAlreadyInTheWebinar();
          }
        },
      );

      const newParticipation = new Participation({
        userId: user.props.id,
        webinarId: webinarId,
      });

      this.participationRepository.save(newParticipation);
      const organizer = this.userRepository.findById(webinar.props.organizerId);

      const mail = new Email({
        to: organizer,
        subject: 'Book seat',
        body: 'A new book seat in your webinar !',
      });
      this.mailer.send(mail);
    }
  }
}
