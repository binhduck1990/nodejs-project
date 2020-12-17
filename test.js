act = async () => {
    try {
        var p1 = promise1()
        var p2 = promise2()
        var p1done = await p1
        var p2done = await p2
    } catch (error) {
        console.log('err', error)
    }
}

promise1 = async () => {
    return new Promise((resolve, reject) => {
        resolve('123')
      })
}

promise2 = async () => {
    return new Promise((resolve, reject) => {
        reject('456')
      })
}

act()