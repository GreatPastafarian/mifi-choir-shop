import React from 'react';

function SortFilter({ onSortChange, currentSort }) {
  return (
    <div className="sort-filter">
    <label className="sort-filter__label" htmlFor="sort-select">Сортировка:</label>
    <div className="sort-filter__wrapper">
    <select
    id="sort-select"
    className="sort-filter__select"
    value={currentSort}
    onChange={(e) => onSortChange(e.target.value)}
    >
    <option value="default">По умолчанию</option>
    <option value="popular">Сначала популярные</option>
    <option value="newest">Сначала новые</option>
    <option value="price_asc">Цена: по возрастанию</option>
    <option value="price_desc">Цена: по убыванию</option>
    <option value="name_asc">Название: А-Я</option>
    <option value="name_desc">Название: Я-А</option>
    </select>
    </div>
    </div>
  );
}

export default SortFilter;
