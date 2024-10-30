import cipherService from './cipher.service';

class LookupCreator {
  createById(items: any[]) {
    return items.reduce(
      (acc, item) => {
        acc[item.id || item._id] = {
          ...item,
          id: cipherService.encodeId(item._id || item.id),
          _id: undefined,
        };
        return acc;
      },
      {} as Record<number | string, (typeof items)[0]>,
    );
  }
}

const lookup = new LookupCreator();
export default lookup;
