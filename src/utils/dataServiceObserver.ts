import { Subject } from 'rxjs';

const subject = new Subject<string>();

export const dataServiceObserver = {
    sendData: (data: string) => subject.next(data),
    getData: () => subject.asObservable()
}