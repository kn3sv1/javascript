/**
 * @typedef {Object} Cat
 * @property {string} id
 * @property {string} name
 * @property {number} age
 * @property {string} photo
 */

export const CatRepository = {
  /**
   * Fetch cats from API.
   * @returns {Promise<Cat[]>}
   */
  async getCats() {
    // fetch data from server
    const response = await fetch("/api/cats");

    /**
     * @type {Cat[]}
     */
    const cats = await response.json();

    return cats;
  },
  /**
   * Fetch cats from API.
   * @returns {Promise<Cat|null>}
   */
  async getCatByName(catName) {
    // fetch data from server
    const response = await fetch("/api/cats?name=" + catName);

    /**
     * @type {Cat}
     */
    const cat = await response.json();

    return cat[0] || null;
  },
};
