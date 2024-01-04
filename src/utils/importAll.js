export default function importAll(r){
    let images = [];
    r.keys().forEach((item, index) => {
        if(item.match(/\.jpg|png|jpeg$/) != null){
            console.log(item);
        }
        console.log(item.match(/\.jpg|png|jpeg$/));
        images.push(r(item));
    });
    return images;
}