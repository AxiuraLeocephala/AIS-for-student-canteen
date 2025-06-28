function ConvertPhoto(list) {
    list.forEach(row => {
        if (row.ProductPhoto instanceof Buffer) {
            row.ProductPhoto = row.ProductPhoto.toString('base64');
        }
    })
    return list;
}

export default ConvertPhoto;