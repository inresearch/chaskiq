import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import {
        Tab ,
        Tabs ,
        Avatar ,
        Typography,
        Button,
        TextField,
        Chip,
        CircularProgress,
        Grid,
        Tooltip,
        IconButton,
        Link as MuiLink
      } from '@material-ui/core';

import gravatar from '../shared/gravatar'
import {LinkButton, LinkIconButton} from '../shared/RouterLink'

import AddIcon from '@material-ui/icons/Add'

import GestureIcon from '@material-ui/icons/Gesture'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import DataTable from "../components/newTable";

import ScrollableTabsButtonForce from '../components/scrollingTabs'
import langs from '../shared/langsOptions'

import {Link} from 'react-router-dom'

import graphql from '../graphql/client'
import {ARTICLES} from '../graphql/queries'
import {
  CREATE_ARTICLE, 
  EDIT_ARTICLE, 
  DELETE_ARTICLE,
  ARTICLE_SETTINGS_UPDATE
} from '../graphql/mutations'

import { withStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import FormDialog from '../components/FormDialog'
import ArticlesNew from './articles/new'
import Settings from './articles/settings'

import Collections from './articles/collections/index'
import CollectionDetail from './articles/collections/show'

import {setCurrentPage} from '../actions/navigation'
import {
  ARTICLE_SETTINGS
} from '../graphql/queries'


const styles = theme => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
});




class Articles extends Component {

  state = {
    meta: {},
    tabValue: 0,
    settings: null,
    errors: []
  };

  componentDidMount(){
    this.getSettings()
  }

  getSettings = (cb)=>{
    graphql(ARTICLE_SETTINGS, {
      appKey: this.props.app.key
    }, {
      success: (data)=>{
        this.setState({
          settings: data.app.articleSettings
        }, cb)
      },
      error: (e)=>{
        debugger
      }
    })
  }

  updateSettings = (data)=>{
    const {settings} = data
    graphql(ARTICLE_SETTINGS_UPDATE, {
      appKey: this.props.app.key,
      settings: settings
    }, {
      success: (data)=>{
        this.setState({
          settings: data.articleSettingsUpdate.settings,
          errors: data.articleSettingsUpdate.errors
        })
      },
      error: (e)=>{
        debugger
      }
    })
  }

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="All" />
              <Tab textColor="inherit" label="Published" />
              <Tab textColor="inherit" label="Draft" />
            </Tabs>
  }

  renderTabcontent = ()=>{

    switch (this.state.tabValue){
      case 0:
        return <AllArticles {...this.props} settings={this.state.settings}/>

      case 1:
        return <PublishedArticles {...this.props} settings={this.state.settings}/>
      case 2:
        return 
      case 3:
        return <p>drafts</p>
    }
  }

  render() {
    return (
       <React.Fragment>

       {
         this.state.settings ?
       

        <Switch>

          <Route exact path={`/apps/${this.props.app.key}/articles`}
            render={(props) => {
              return <React.Fragment>
                <ContentHeader 
                  title={ 'Articles' }
                  tabsContent={ this.tabsContent() }
                  items={
                    <React.Fragment>
                    {
                      this.state.settings && this.state.settings.subdomain ?
                        <Grid item>
                          <Button href={`https://${this.state.settings.subdomain}.chaskiq.io`}
                            variant="outlined" color="inherit" size="small" target={"blank"}>
                            visit help center
                          </Button>
                        </Grid> : null 
                    }
                    </React.Fragment>
                  }
                />
                {this.state.settings ? this.renderTabcontent() : null }
              </React.Fragment>
            }} 
          />

          <Route exact path={`/apps/${this.props.app.key}/articles/settings`}
              render={(props) => {
                return <Settings 
                          settings={this.state.settings}
                          errors={this.state.errors}
                          getSettings={this.getSettings}
                          match={props.match}
                          history={props.history}
                          update={this.updateSettings}
                        />
              }} 
            />

          <Route exact path={`/apps/${this.props.app.key}/articles/collections`}
              render={(props) => {
                return <Collections 
                          settings={this.state.settings}
                          getSettings={this.getSettings}
                          match={props.match}
                          history={props.history}
                        />
              }} 
            />

          <Route exact path={`/apps/${this.props.app.key}/articles/collections/:id`}
              render={(props) => {
                return <CollectionDetail
                          settings={this.state.settings}
                          getSettings={this.getSettings}
                          match={props.match}
                          history={props.history}
                        />
              }} 
          />

          <Route exact path={`/apps/${this.props.app.key}/articles/:id`}
            render={(props) => {
              return <ArticlesNew
                        settings={this.state.settings}
                        getSettings={this.getSettings}
                        history={this.props.history}
                        data={{}}
                    />
            }} 
          />

        </Switch> : null 
      }

      </React.Fragment>
    );
  }
}


class AllArticles extends React.Component {
  state = {
    collection: [],
    loading: true,
    lang: "en"
  }

  componentDidMount(){
    this.search()

    this.props.dispatch(
      setCurrentPage('Help Center')
    )
  }

  getArticles = ()=>{
    graphql(ARTICLES, {
      appKey: this.props.app.key, 
      page: 1,
      lang: this.state.lang
    }, {
      success: (data)=>{
        this.setState({
          collection: data.app.articles.collection, 
          meta: data.app.articles.meta,
          loading: false
        })
      },
      error: ()=>{
      }
    })
  }

  handleLangChange = (lang)=>{
    this.setState({
      lang: lang
    }, this.getArticles)
  }

  search = (item)=>{
    this.setState({
      loading: true, 
    }, this.getArticles )
  }

  renderActions = ()=>{
    return <Grid container direction="row" justify="flex-end">
              <Grid item>
                <LinkButton 
                  variant={'contained'} 
                  color={'primary'} 
                  to={`/apps/${this.props.app.key}/articles/new`}>
                  <AddIcon />
                  {" New article"}
                </LinkButton>
              </Grid>
            </Grid>
  }

  render(){
    return <Content actions={this.renderActions()} >

              <ScrollableTabsButtonForce
                tabs={this.props.settings.availableLanguages.map((o)=> langs.find((lang)=> lang.value === o) )} 
                changeHandler={(index)=> this.handleLangChange( this.props.settings.availableLanguages[index] )}
              />

             {
               !this.state.loading ?
               <DataTable 
                elevation={0}
                title={'agents'}
                meta={{}}
                rows={this.state.collection}
                search={this.search}
                loading={this.state.loading}
                disablePagination={true}
                columns={[
                  {name: "id", title: "id"},
                  {name: "title", title: "title", 
                    getCellValue: row => (row ? 
                      <Link to={`/apps/${this.props.app.key}/articles/${row.id}`}>
                        {row.title ? row.title : "-- missing translation --"}
                      </Link>
                   : undefined )

                },
                  {name: "author", title: "author",
                  getCellValue: row => (row ? 

                    <p>{row.author ? 
                      <span>
                        { row.author.name }<br/>
                        {row.author.email}
                      </span>
                       : 'no author'}
                    </p>
                  : undefined)
                },
                  {name: "state", title: "state", getCellValue: row => (row ?
                    <Chip 
                      variant="outlined" 
                      color={row.state === "draft" ? 'secondary' : 'primary' }
                      size="small" 
                      label={row.state}
                      //deleteIcon={<DoneIcon />} 
                      //onDelete={handleDelete} 
                      icon={ row.state === "draft" ? <GestureIcon/> : <CheckCircleIcon /> } 
                    /> : null 
  
                  )},
                  {name: "collection", title: "collection", 
                    getCellValue: row => (row ? 
                    <p>{row.collection ? 
                        <Link to={`/apps/${this.props.app.key}/articles/collections/${row.collection.id}`}>
                          {row.collection.title}
                        </Link> : 
                      '--'}
                    </p>
                    : undefined)
                  }
                ]}
                defaultHiddenColumnNames={[]}
                tableColumnExtensions={[
                  { columnName: 'title', width: 250 },
                  { columnName: 'id', width: 10 },
                ]}

                //tableEdit={true}
                //editingRowIds={["email", "name"]}
                commitChanges={(aa, bb)=>{debugger}}
                //leftColumns={this.props.leftColumns}
                //rightColumns={this.props.rightColumns}
                //toggleMapView={this.props.toggleMapView}
                //map_view={this.props.map_view}
                enableMapView={false}
             /> : <CircularProgress/> 
           }
           </Content>  
  }


}

class PublishedArticles extends React.Component {
  render(){
    return <p>o</p>
  }
}

function mapStateToProps(state) {

  const { auth, app } = state
  const { isAuthenticated } = auth
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated
  }
}


export default withRouter(connect(mapStateToProps)(withStyles(styles)(Articles)))