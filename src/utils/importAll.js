export default function importAll(r){
    let images = [];
    r.keys().forEach((item, index) => {
        if(item.match(/\.jpg|png|jpeg$/) != null){
            images.push(r(item));
        }
        /* images.push(r(item)); */
    });
    return images;
}