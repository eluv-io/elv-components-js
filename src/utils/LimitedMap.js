const LimitedMap = async (limit, array, f) => {
  let index = 0;
  let locked = false;
  const nextIndex = async () => {
    while(locked) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    locked = true;
    const thisIndex = index;
    index += 1;
    locked = false;

    return thisIndex;
  };

  let results = [];
  let active = 0;
  return new Promise((resolve, reject) => {
    [...Array(limit || 1)].forEach(async () => {
      active += 1;
      let index = await nextIndex();

      while(index < array.length) {
        try {
          results[index] = await f(array[index], index);
        } catch(error) {
          reject(error);
        }

        index = await nextIndex();
      }

      // When finished and no more workers are active, resolve
      active -= 1;
      if(active === 0) {
        resolve(results);
      }
    });
  });
};

Array.prototype.limitedMap = async function(limit, f) {
  return await LimitedMap(limit, this, f);
};
