export type Uri = {
    base: string;
    mode: string;
    slug: string;
    map: string;
}

export function playUriParse(url: string): Uri {
    const comp = url.split('/');
    let cur = 'start';
    let base = '';
    let slug = '';
    let mode = ''
    let map='';

    comp.forEach(part =>  {
        if (cur == 'start') {
            if (part == '_') {
                mode = 'public';
                cur = 'slug';
            } else if (part=='@')
            {
                mode = 'controlled';
                cur='slug';
            } else {
                base += part + '/';
            }
        }
        else if (cur == 'slug' ) {
            slug = part ;
            cur = 'map' ;
        }
        else if (cur == 'map' ) {
            map += part + '/';
        }
    });

    map = map.substring(0, map.length - 1);

    if (mode =='public') {
        map = 'https://' + map;
    }

    return { base, mode, slug, map };
}

export function postIframeMessage(message: any) {
    if (message) {
        try {
            window?.top?.postMessage(message, '*');
        } catch (error) {
            console.error('Enable to send message to main window. ', JSON.stringify(message), error);
        }
    }
}