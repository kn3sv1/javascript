/**
 * @typedef {Object} Doctor
 * @property {string} id
 * @property {string} name
 * @property {string} photo
 */

export const DoctorRepository = {
  /**
   * Fetch cats from API.
   * @returns {Promise<Doctor[]>}
   */
  async getAll() {
    // fetch data from server
    const response = await fetch("/api/doctors");

    /**
     * @type {Doctor[]}
     */
    const data = await response.json();

    return data;
  },
  /**
   * Fetch cats from API.
   * @returns {Promise<Cat|null>}
   */
  async getByName(name) {
    // fetch data from server
    const response = await fetch("/api/doctors?name=" + name);

    /**
     * @type {Doctor}
     */
    const data = await response.json();

    return data[0] || null;
  },
};
