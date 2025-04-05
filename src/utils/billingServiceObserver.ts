import { Subject } from 'rxjs';

const subject = new Subject<string>();

export const billingServiceObserver = {
    sendData: (data: string) => subject.next(data),
    getData: () => subject.asObservable()
}