const Gener = require('../models/gener');
const SuperUser = require('../models/superUser');
const User = require('../models/user');
const Song = require('../models/song');

const getGener = async generName => {
    const gener = await Gener.findOne({generName: generName});
    const formatted_gener = gener? gener._id : null;
    return formatted_gener;
};

const getAdditionalGener = async additionalGener => {

    const geners = [];
    let i = 0;
    while(i <  additionalGener.length) {
        const newGener = await getGener(additionalGener[i])
        geners.push(newGener);
        if(geners.length == i+1)
        i++;
    }
    return geners;
}


const reorderFavoriteGeners = async(mongoList, listToAdd) => {
    listToAdd.forEach(x => {
        let flag = false;
        mongoList.forEach(y => {
            if(x.generName == y.generName)
                flag = true;
        })

        if(!flag){
             mongoList.push(x);
        }
    })
}


const getSub = async artistName => {
    const artist = await SuperUser.findOne({artistName: artistName});
    const formatted_artist = artist? {artistName: artist.artistName, _id: artist._id} : null;
    return formatted_artist;
};

const getSubScribes = async subscribes => {

    const subs = [];
    let i = 0;
    while(i <  subscribes.length) {
        const newSub = await getSub(subscribes[i])
        subs.push(newSub);
        if(subs.length == i+1)
        i++;
    }
    return subs;
}


const reorderSubscribes = async(mongoList, listToAdd) => {
    listToAdd.forEach(x => {
        let flag = false;
        mongoList.forEach(y => {
            if(x.artistName == y.artistName)
                flag = true;
        })

        if(!flag){
             mongoList.push(x);
        }
    })
}


// module.exports = {
//     getGener,
//     getAdditionalGener,
//     reorderFavoriteGeners,
//     getSub,
//     getSubScribes,
//     reorderSubscribes,   
// }
