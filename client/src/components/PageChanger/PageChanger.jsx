import React from 'react';
import { connect } from 'react-redux';
import { getPage } from '../../redux/actions';
import styles from './pagechanger.module.css';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';

function PageChanger({ page, pages, allRecipes, getPage }) {
	function handlePrevPage(e) {
		e.preventDefault();
		getPage(allRecipes, --page);
	}

	function handleNextPage(e) {
		e.preventDefault();
		getPage(allRecipes, ++page);
	}

	function handleChangePage(e) {
		e.preventDefault();
		getPage(allRecipes, e.target.name);
	}

	function getAllPages(num) {
		const pages = [];
		for (let i = 0; i < num; i++) {
			pages.push(i + 1);
		}
		return pages;
	}

	return (
		<div className={styles.pageChanger}>
			{pages > 1 && (
				<div className={styles.pageChanger}>
					{page > 1 ? (
						<button
							onClick={(e) => handlePrevPage(e)}
							className={styles.pageChangerBtn}
						>
							<FaArrowAltCircleLeft />
						</button>
					) : (
						<button disabled={true} className={styles.pageChangerBtn}>
							<FaArrowAltCircleLeft />
						</button>
					)}
					{getAllPages(pages)
						.slice(0, page - 1)
						.map((num) => (
							<button
								key={num}
								onClick={(e) => handleChangePage(e)}
								className={styles.pageBtn}
								name={num}
							>
								{num}
							</button>
						))}
					<button disabled={true} className={styles.actualPageBtn}>
						{page}
					</button>
					{getAllPages(pages)
						.slice(page)
						.map((num) => (
							<button
								key={num}
								onClick={(e) => handleChangePage(e)}
								className={styles.pageBtn}
								name={num}
							>
								{num}
							</button>
						))}
					{page < pages ? (
						<button
							onClick={(e) => handleNextPage(e)}
							className={styles.pageChangerBtn}
						>
							<FaArrowAltCircleRight />
						</button>
					) : (
						<button disabled={true} className={styles.pageChangerBtn}>
							<FaArrowAltCircleRight />
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		page: state.actualPage,
		pages: state.pages,
		allRecipes: state.recipes,
	};
}

export default connect(mapStateToProps, { getPage })(PageChanger);
