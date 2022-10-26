/// <reference types="@workadventure/iframe-api-typings" />

import { getLayersMap } from "@workadventure/scripting-api-extra";
import { ActionMessage } from "@workadventure/iframe-api-typings/Api/Iframe/Ui/ActionMessage";
import { postIframeMessage } from "./common";

console.log('Script started successfully');

let message: ActionMessage | undefined;

// Waiting for the API to be ready
WA.onInit().then(async () => {

    let layers = await getLayersMap();
    console.log('Current player name : ', WA.player.name);
    console.log(layers);

    layers.forEach((val, key) => {
        if (val && val.properties) {
            val.properties.forEach(prop => {

                if (prop.name === 'goto') {
                    console.log("GotoLayer : " + key);
                    let config: {action: "goto", value: object, type: string, confirmMessage?: string } | undefined = undefined;

                    try {
                        config = JSON.parse(prop.value as string);
                    } catch(error) {
                        /* silent error */
                    }

                    if (config) {
                        WA.room.onEnterLayer(key).subscribe(() => {
                            if (config?.confirmMessage) {
                                if (message) message.remove();
                                message = WA.ui.displayActionMessage({
                                    message: config.confirmMessage,
                                    type: "message",
                                    callback: () => postIframeMessage(config)
                                })
                            } else {
                                postIframeMessage(config)
                            }
                        })
                    }
                    if (config?.confirmMessage) {
                        WA.room.onLeaveLayer(key).subscribe(() => {
                            if (message) {
                                message.remove();
                                message = undefined;
                            }
                        })
                    }
                } else if (prop.type === 'string' && prop.name === 'openTeam') {
                    WA.room.onEnterLayer(key).subscribe(() => {
                        WA.ui.displayActionMessage({
                            message: "press 'space' to start",
                            callback: () => {
                                WA.nav.openCoWebSite('https://meet.google.com/kzd-kime-iau', true, "*", 70, 1, true, true);
                                // WA.nav.openTab(prop.value as string);
                            }
                    })});
                } else if (prop.type === 'string' && prop.name === 'jitsiRoom') {
                    WA.room.onEnterLayer(key).subscribe(() => {
                        postIframeMessage({
                            action: "visio",
                            type: "jitsi",
                            value: prop.value
                        })
                    })

                    WA.room.onLeaveLayer(key).subscribe(() => {
                        postIframeMessage({
                            action: "visio",
                            type: "jitsi",
                            value: "_leave"
                        })
                    })
                }
            });
        }
    })

}).catch(e => console.error(e));

export {};
