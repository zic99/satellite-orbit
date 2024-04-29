import styles from './index.css';

function BasicLayout(props) {
    console.log(props)
    return (
        <div className={styles.normal}>
            {props.children}
        </div>
    );
}

export default BasicLayout;
