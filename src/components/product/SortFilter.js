// src/components/SortFilter.js
import React from 'react';

function SortFilter({ onSortChange }) {
  return (
    <div className="sort-filter">
      <div className="sort-filter">
        <label>Сортировка:</label>
        <select onChange={(e) => onSortChange(e.target.value)}>
          <option value="default">Без сортировки</option>
          <option value="price_asc">По сумме взноса: от низкой к высокой</option>
          <option value="price_desc">По сумме взноса: от высокой к низкой</option>
          <option value="name_asc">По названию: от А до Я</option>
          <option value="name_desc">По названию: от Я до А</option>
          <option value="newest">По новизне</option>
          <option value="popular">По популярности</option>
        </select>
      </div>
    </div>
  );
}

export default SortFilter;
