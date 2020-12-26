export enum HTTP_TYPE {
    POST = 'POST',
    GET = 'GET',
    DELETE = 'DELETE',
    SUB_ROUTE = 'SUB_ROUTE',
}

export interface RoutesDescription {
    baseUrl: string;
    routes: UrlSegment[];
}


export class UrlSegment {
    path: string;
    description?: string;
    children: UrlSegment[];
    params: UrlParam[];
    HttpType: HTTP_TYPE;
}

type Prop = String | Number | Object | Boolean;

export class UrlParam {
    name: string
    type: Prop;
}

const routes: RoutesDescription = {
    baseUrl: 'test.com',
    routes: [
        {
            path: 'provide-extension',
            params: [],
            HttpType: HTTP_TYPE.SUB_ROUTE,
            children: [
                {
                    path: 'email-address',
                    params: [],
                    HttpType: HTTP_TYPE.SUB_ROUTE,
                    children: [
                        {
                            path: '',
                            HttpType: HTTP_TYPE.GET,
                            description: 'getting a mail for an ID',
                            children: [],
                            params: [
                                {
                                    name: 'id',
                                    type: Number,
                                }
                            ]
                        },
                        {
                            path: '',
                            description: 'adding an email address',
                            HttpType: HTTP_TYPE.POST,
                            children: [],
                            params: [
                                {
                                    name: 'mail',
                                    type: String,
                                }
                            ]
                        }
                    ]
                }
            ],

        }
    ]
}
