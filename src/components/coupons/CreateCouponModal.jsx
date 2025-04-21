import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const CreateCouponModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">關閉</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-white"
                    >
                      新增優惠券
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="code"
                          className="block text-sm font-medium text-gray-300"
                        >
                          優惠券代碼
                        </label>
                        <input
                          type="text"
                          name="code"
                          id="code"
                          required
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.code}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="discountType"
                          className="block text-sm font-medium text-gray-300"
                        >
                          折扣類型
                        </label>
                        <select
                          name="discountType"
                          id="discountType"
                          required
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.discountType}
                          onChange={handleChange}
                        >
                          <option value="percentage">百分比</option>
                          <option value="fixed">固定金額</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="discountValue"
                          className="block text-sm font-medium text-gray-300"
                        >
                          折扣值
                        </label>
                        <input
                          type="number"
                          name="discountValue"
                          id="discountValue"
                          required
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.discountValue}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="minPurchase"
                          className="block text-sm font-medium text-gray-300"
                        >
                          最低消費
                        </label>
                        <input
                          type="number"
                          name="minPurchase"
                          id="minPurchase"
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.minPurchase}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="maxDiscount"
                          className="block text-sm font-medium text-gray-300"
                        >
                          最大折扣
                        </label>
                        <input
                          type="number"
                          name="maxDiscount"
                          id="maxDiscount"
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.maxDiscount}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="usageLimit"
                          className="block text-sm font-medium text-gray-300"
                        >
                          使用次數限制
                        </label>
                        <input
                          type="number"
                          name="usageLimit"
                          id="usageLimit"
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.usageLimit}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium text-gray-300"
                        >
                          開始日期
                        </label>
                        <input
                          type="datetime-local"
                          name="startDate"
                          id="startDate"
                          required
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.startDate}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="endDate"
                          className="block text-sm font-medium text-gray-300"
                        >
                          結束日期
                        </label>
                        <input
                          type="datetime-local"
                          name="endDate"
                          id="endDate"
                          required
                          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={formData.endDate}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          id="isActive"
                          className="h-4 w-4 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500"
                          checked={formData.isActive}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="isActive"
                          className="ml-2 block text-sm text-gray-300"
                        >
                          立即啟用
                        </label>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          建立
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-700 bg-gray-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={onClose}
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

CreateCouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CreateCouponModal; 