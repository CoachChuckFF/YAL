import fetch from 'node-fetch';

let settings = { method: "Get" };
export const getJsonMetadata = async(url:string) => {
    return new Promise((resolve, reject)=>{
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            resolve(json);
        });
    });
}
