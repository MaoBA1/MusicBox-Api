const getGener = async generName => {
    const gener = await Gener.findOne({generName: generName});
    const formatted_gener = gener? {generName: gener.generName, _id: gener._id} : null;
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


module.exports = {
    getGener,
    getAdditionalGener,
    reorderFavoriteGeners
}
